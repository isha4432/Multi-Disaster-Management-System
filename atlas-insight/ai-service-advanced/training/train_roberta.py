
import argparse, json, os
import pandas as pd, numpy as np
from datasets import Dataset
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--data",default="data/raw/tweets.csv")
    ap.add_argument("--out",default="models/roberta")
    ap.add_argument("--epochs",type=int,default=2)
    ap.add_argument("--batch",type=int,default=8)
    a=ap.parse_args()
    df=pd.read_csv(a.data)[["text","target"]].dropna()
    df["target"]=df["target"].astype(int)
    tr,te=train_test_split(df,test_size=.2,random_state=42,stratify=df.target)
    tr,va=train_test_split(tr,test_size=.125,random_state=42,stratify=tr.target)
    tok=AutoTokenizer.from_pretrained("roberta-base")
    def enc(b): return tok(b["text"],truncation=True,padding="max_length",max_length=160)
    def ds(x):
        d=Dataset.from_pandas(x,preserve_index=False).map(enc,batched=True).rename_column("target","labels")
        d.set_format("torch",columns=["input_ids","attention_mask","labels"]); return d
    tr,va,te=ds(tr),ds(va),ds(te)
    model=AutoModelForSequenceClassification.from_pretrained("roberta-base",num_labels=2)
    def metrics(p):
        y=p.label_ids; h=np.argmax(p.predictions,axis=-1)
        pr,re,f1,_=precision_recall_fscore_support(y,h,average="binary",zero_division=0)
        return {"accuracy":accuracy_score(y,h),"precision":pr,"recall":re,"f1":f1}
    os.makedirs(a.out,exist_ok=True)
    args=TrainingArguments(output_dir=a.out,num_train_epochs=a.epochs,
        per_device_train_batch_size=a.batch,per_device_eval_batch_size=a.batch,
        learning_rate=2e-5,weight_decay=.01,eval_strategy="epoch",
        save_strategy="epoch",load_best_model_at_end=True,metric_for_best_model="f1",
        report_to=[])
    t=Trainer(model=model,args=args,train_dataset=tr,eval_dataset=va,compute_metrics=metrics)
    t.train(); pred=t.predict(te); h=np.argmax(pred.predictions,axis=-1)
    pr,re,f1,_=precision_recall_fscore_support(te["labels"],h,average="binary",zero_division=0)
    report={"model":"roberta-base-finetuned-disaster","test_samples":len(te),
            "accuracy":float(accuracy_score(te["labels"],h)),"precision":float(pr),
            "recall":float(re),"f1":float(f1),
            "confusion_matrix":confusion_matrix(te["labels"],h).tolist()}
    t.save_model(a.out); tok.save_pretrained(a.out)
    json.dump(report,open(os.path.join(a.out,"metrics.json"),"w"),indent=2)
    print(json.dumps(report,indent=2))
if __name__=="__main__": main()
