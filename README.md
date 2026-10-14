# 🌍 Multimodal AI-Based Disaster Intelligence and Real-Time Response System

An AI-powered disaster intelligence platform designed to analyze disaster-related information, classify emergency reports, and support disaster assessment through machine learning and geospatial visualization.

## 📌 Project Overview

Natural disasters such as floods, earthquakes, landslides, and cyclones can cause significant damage and threaten human lives. Identifying affected areas and organizing relevant information quickly is an important challenge during disaster response.

This project aims to develop a multimodal AI framework that combines disaster-related text analysis, satellite imagery, and geospatial information to support disaster monitoring and emergency response.

The system uses **RoBERTa-based text classification** to identify disaster-related reports and is designed to support future integration of satellite imagery and real-time data sources.

## 🎯 Objectives

- Classify disaster-related and non-disaster-related text using NLP.
- Train and evaluate a RoBERTa-based classification model.
- Measure model performance using accuracy, precision, recall, and F1-score.
- Visualize disaster information through a dashboard and geospatial maps.
- Explore multimodal intelligence by combining text and satellite imagery.
- Support the organization of information useful for disaster assessment and relief planning.

## ✨ Key Features

- **Disaster Text Classification:** Identify disaster-related reports using NLP.
- **Model Training:** Fine-tune a pretrained RoBERTa model using labeled data.
- **Performance Evaluation:** Evaluate predictions on held-out test data.
- **Dataset Analysis:** Inspect dataset records, class distribution, and data splits.
- **Geospatial Visualization:** Present disaster information on maps where location data is available.
- **Disaster Dashboard:** Organize incident information and reports.
- **Extensible Architecture:** Designed for future satellite imagery and live data integration.

## 🧠 AI and Machine Learning

### RoBERTa

RoBERTa is used as the text classification model. It learns from labeled disaster-related text and predicts whether an input belongs to the disaster or non-disaster category.

### Model Evaluation

The training workflow can use separate training, validation, and testing subsets.

- Training set: used to train the model.
- Validation set: used to monitor and tune the model.
- Test set: used for final evaluation on unseen examples.

The evaluation metrics include:

- Accuracy
- Precision
- Recall
- F1-score
- Confusion matrix

**Note:** Actual performance values must be obtained by running the training and evaluation pipeline. No accuracy percentage is assumed in advance.

## 🗂️ Project Structure

```text
project/
├── ai-service/
│   ├── app/
│   ├── data/
│   │   └── raw/
│   │       └── tweets.csv
│   ├── training/
│   │   └── train_roberta.py
│   ├── models/
│   └── requirements.txt
├── frontend/
└── README.md
```

*The exact folder names may differ depending on the project version.*

## 🛠️ Technologies Used

- Python
- PyTorch
- Hugging Face Transformers
- RoBERTa
- Pandas and NumPy
- Scikit-learn
- React and JavaScript/TypeScript, if included in the frontend
- Geospatial mapping tools, depending on the configured implementation

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

Replace the placeholders with your actual repository URL and folder name.

### 2. Create a Python virtual environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies

```bash
python -m pip install -r requirements.txt
```

Run this command from the directory containing the relevant `requirements.txt` file.

### 4. Prepare the dataset

Place the compatible labeled dataset at:

```text
ai-service/data/raw/tweets.csv
```

The training script expects the columns `text` and `target`, where the target labels represent the dataset's two classes.

### 5. Train and evaluate the model

From the `ai-service` directory, run:

```bash
python training/train_roberta.py
```

The script should report training progress and evaluation results if the dataset, dependencies, and training code are correctly configured.

**First-run note:** A pretrained model may need to be downloaded from Hugging Face. Training time and memory requirements depend on your computer and dataset size.

## 📊 Results and Evaluation

Record the results from your actual experiment here after training:

| Metric | Experimental result |
|---|---|
| Training dataset size | To be measured |
| Validation dataset size | To be measured |
| Test dataset size | To be measured |
| Accuracy | To be measured |
| Precision | To be measured |
| Recall | To be measured |
| F1-score | To be measured |

These values should come from the program's actual output rather than estimated or manually assigned values.

## 🔮 Future Enhancements

- Integrate Copernicus Sentinel-1 and Sentinel-2 satellite data.
- Implement image analysis using vision models such as CLIP or ViT.
- Build a verified real-time social-media or emergency-data ingestion pipeline.
- Develop multimodal fusion across text and satellite imagery.
- Improve location extraction and incident geocoding.
- Add verified resource estimation and emergency alert workflows.
- Deploy the system for authorized users and disaster-response organizations.

These enhancements depend on implementing and validating the required integrations and models.

## ⚠️ Limitations

- Classification performance depends on dataset quality and representativeness.
- Social-media reports may be inaccurate, duplicated, or misleading.
- Satellite imagery requires suitable data access and processing.
- Live information requires working API integrations and valid credentials where applicable.
- Model predictions should not be treated as verified emergency intelligence without human validation.

## 👩‍💻 Author

**Isha Rehman Mahammad**

GitHub: [isha4432](https://github.com/isha4432)

## 📄 License

Choose a suitable open-source license before distributing the project. For example, the MIT License can be used if you want to permit reuse under its terms and you have the rights to license all included components.
