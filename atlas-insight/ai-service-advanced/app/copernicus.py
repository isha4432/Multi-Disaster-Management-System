
import os,requests
TOKEN="https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS="https://sh.dataspace.copernicus.eu/api/v1/process"
def token():
    cid=os.getenv("COPERNICUS_CLIENT_ID"); sec=os.getenv("COPERNICUS_CLIENT_SECRET")
    if not cid or not sec: raise RuntimeError("Configure Copernicus OAuth credentials in .env")
    r=requests.post(TOKEN,data={"client_id":cid,"client_secret":sec,"grant_type":"client_credentials"},timeout=20); r.raise_for_status(); return r.json()["access_token"]
def sentinel_preview(bbox,start,end):
    t=token()
    payload={"input":{"bounds":{"bbox":bbox},"data":[{"type":"sentinel-2-l2a","dataFilter":{"timeRange":{"from":start,"to":end}}}]},"output":{"width":512,"height":512,"responses":[{"identifier":"default","format":{"type":"image/png"}}]}}
    r=requests.post(PROCESS,headers={"Authorization":f"Bearer {t}"},json=payload,timeout=120); r.raise_for_status(); return r.content
