
import os, json
from datetime import datetime, timezone
from typing import Optional, List
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
app=FastAPI(title="Atlas Insight AI Service",version="2.0")
# Dev-friendly CORS so a browser frontend can call this service directly.
# Tighten allow_origins before deploying this anywhere public.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
MODEL_DIR=os.getenv("ROBERTA_MODEL_DIR","models/roberta")
model=tokenizer=None
class TextIn(BaseModel): text:str
class ImageEvidence(BaseModel): label:str; confidence:float; source:str="image"
class FusionIn(BaseModel):
    text_confidence:Optional[float]=None
    image_evidence:List[ImageEvidence]=[]
    satellite_confidence:Optional[float]=None
    weather_confidence:Optional[float]=None

def load_model():
    global model,tokenizer
    if model is not None:return
    try:
        from transformers import AutoTokenizer,AutoModelForSequenceClassification
        tokenizer=AutoTokenizer.from_pretrained(MODEL_DIR)
        model=AutoModelForSequenceClassification.from_pretrained(MODEL_DIR); model.eval()
    except Exception as e: raise RuntimeError("Train RoBERTa first: python training/train_roberta.py") from e

@app.get("/health")
def health(): return {"ok":True,"roberta_ready":os.path.isdir(MODEL_DIR),"time":datetime.now(timezone.utc).isoformat()}

@app.post("/predict")
def predict(x:TextIn):
    if not x.text.strip(): raise HTTPException(400,"text is required")
    try:
        load_model(); import torch
        with torch.no_grad():
            p=torch.softmax(model(**tokenizer(x.text,return_tensors="pt",truncation=True,max_length=160)).logits,dim=-1)[0]
        return {"model":"RoBERTa","label":int(torch.argmax(p)),"disaster_probability":float(p[1]),"confidence":float(torch.max(p))}
    except RuntimeError as e: raise HTTPException(503,str(e))

@app.get("/metrics")
def metrics():
    p=os.path.join(MODEL_DIR,"metrics.json")
    return {"available":os.path.exists(p),**(json.load(open(p)) if os.path.exists(p) else {})}

@app.get("/usgs")
def usgs():
    r=requests.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",timeout=15)
    r.raise_for_status(); return {"source":"USGS","fetched_at":datetime.now(timezone.utc).isoformat(),"features":r.json().get("features",[])}

@app.get("/firms")
def firms():
    key=os.getenv("NASA_FIRMS_MAP_KEY","").strip()
    if not key:return {"enabled":False,"reason":"NASA_FIRMS_MAP_KEY is not configured","features":[]}
    r=requests.get(f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/VIIRS_SNPP_NRT/world/1",timeout=30)
    r.raise_for_status(); return {"enabled":True,"source":"NASA FIRMS","csv":r.text.splitlines()[:5001]}

@app.get("/weather")
def weather(lat:float,lon:float):
    key=os.getenv("OPENWEATHER_API_KEY","").strip()
    if not key:return {"enabled":False,"reason":"OPENWEATHER_API_KEY is not configured"}
    r=requests.get("https://api.openweathermap.org/data/2.5/weather",params={"lat":lat,"lon":lon,"appid":key},timeout=15)
    r.raise_for_status(); return {"enabled":True,"source":"OpenWeather","data":r.json()}

@app.get("/social")
def social(q:str="flood disaster",limit:int=25):
    r=requests.get("https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts",params={"q":q,"limit":min(limit,100)},timeout=20)
    r.raise_for_status(); return {"source":"Bluesky public API","fetched_at":datetime.now(timezone.utc).isoformat(),"data":r.json()}

@app.post("/fusion")
def fusion(x:FusionIn):
    vals=[]
    if x.text_confidence is not None: vals.append(("text",x.text_confidence))
    if x.satellite_confidence is not None: vals.append(("satellite",x.satellite_confidence))
    if x.weather_confidence is not None: vals.append(("weather",x.weather_confidence))
    vals += [(e.source,e.confidence) for e in x.image_evidence]
    if not vals:return {"confidence":0,"uncertainty":1,"sources":0}
    w={"text":1,"satellite":1.2,"weather":.7,"image":1}
    den=sum(w.get(s,1) for s,_ in vals); c=sum(max(0,min(1,v))*w.get(s,1) for s,v in vals)/den
    spread=(sum((v-c)**2 for _,v in vals)/len(vals))**.5
    return {"confidence":round(c,4),"uncertainty":round(min(1,.5*spread+.5/len(vals)),4),"sources":len(vals),"evidence":vals}


@app.get("/credential-status")
def credential_status():
    return {
        "usgs": {"configured": True, "key_required": False},
        "nasa_firms": {"configured": bool(os.getenv("NASA_FIRMS_MAP_KEY", "").strip()), "key_required": True},
        "openweather": {"configured": bool(os.getenv("OPENWEATHER_API_KEY", "").strip()), "key_required": True},
        "copernicus": {"configured": bool(os.getenv("COPERNICUS_CLIENT_ID", "").strip() and os.getenv("COPERNICUS_CLIENT_SECRET", "").strip()), "key_required": True}
    }
