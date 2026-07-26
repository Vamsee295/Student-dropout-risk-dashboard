import os
import joblib
import json
from app.ml.preprocessing import DataPreprocessor

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

class ModelLoader:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.preprocessor = None
            cls._instance.metadata = None
            cls._instance.is_loaded = False
            cls._instance.current_version = None
        return cls._instance

    def load_models(self, version_tag: str = None):
        """Loads models and preprocessor into memory if not already loaded."""
        if not self.is_loaded or self.current_version != version_tag:
            if version_tag:
                model_filename = f"model_{version_tag}.joblib"
                metadata_filename = f"metadata_{version_tag}.json"
            else:
                model_filename = "best_model.joblib"
                metadata_filename = "metadata.json"
                
            model_path = os.path.join(MODELS_DIR, model_filename)
            metadata_path = os.path.join(MODELS_DIR, metadata_filename)
            
            if os.path.exists(model_path) and os.path.exists(metadata_path):
                self.model = joblib.load(model_path)
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
                    
                self.preprocessor = DataPreprocessor.load(MODELS_DIR, version_tag)
                self.is_loaded = True
                self.current_version = version_tag
            else:
                self.is_loaded = False
                
    def get_model(self):
        self.load_models()
        return self.model
        
    def get_preprocessor(self):
        self.load_models()
        return self.preprocessor

    def get_metadata(self):
        self.load_models()
        return self.metadata
        
    def reload(self, version_tag: str = None):
        """Forces a reload from disk, useful after retraining or rollback."""
        self.is_loaded = False
        self.load_models(version_tag)

model_loader = ModelLoader()
