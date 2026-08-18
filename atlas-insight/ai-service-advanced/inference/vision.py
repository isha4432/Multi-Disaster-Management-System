
"""CLIP + ViT inference. Official weights are downloaded/cached on first use."""
from PIL import Image
def clip(image_path,labels):
    from transformers import CLIPProcessor,CLIPModel
    import torch
    m=CLIPModel.from_pretrained("openai/clip-vit-base-patch32"); p=CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    x=p(text=labels,images=Image.open(image_path).convert("RGB"),return_tensors="pt",padding=True)
    with torch.no_grad(): z=torch.softmax(m(**x).logits_per_image[0],dim=0)
    return {labels[i]:float(z[i]) for i in range(len(labels))}
def vit(image_path):
    from transformers import AutoImageProcessor,AutoModelForImageClassification
    import torch
    n="google/vit-base-patch16-224"; p=AutoImageProcessor.from_pretrained(n); m=AutoModelForImageClassification.from_pretrained(n)
    x=p(images=Image.open(image_path).convert("RGB"),return_tensors="pt")
    with torch.no_grad(): z=torch.softmax(m(**x).logits,dim=-1)[0]
    i=int(torch.argmax(z)); return {"label":m.config.id2label[i],"confidence":float(z[i])}
