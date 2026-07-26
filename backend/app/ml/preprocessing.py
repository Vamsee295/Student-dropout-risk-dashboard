import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
import joblib
import os

class DataPreprocessor:
    def __init__(self, categorical_cols=None, numerical_cols=None):
        self.categorical_cols = categorical_cols or []
        self.numerical_cols = numerical_cols or []
        self.scaler = StandardScaler()
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
        self.num_imputer = SimpleImputer(strategy='median')
        self.cat_imputer = SimpleImputer(strategy='most_frequent')
        
    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        if self.numerical_cols:
            df[self.numerical_cols] = self.num_imputer.fit_transform(df[self.numerical_cols])
        if self.categorical_cols:
            df[self.categorical_cols] = self.cat_imputer.fit_transform(df[self.categorical_cols])
        return df

    def handle_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        return df.drop_duplicates()

    def handle_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Cap outliers using the IQR method for numerical columns.
        """
        df = df.copy()
        for col in self.numerical_cols:
            if col in df.columns:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                df[col] = np.clip(df[col], lower_bound, upper_bound)
        return df

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df = self.handle_duplicates(df)
        df = self.handle_missing_values(df)
        df = self.handle_outliers(df)
        
        # Scale numerical features
        if self.numerical_cols:
            df[self.numerical_cols] = self.scaler.fit_transform(df[self.numerical_cols])
            
        # Encode categorical features
        if self.categorical_cols:
            encoded_cats = self.encoder.fit_transform(df[self.categorical_cols])
            cat_cols = self.encoder.get_feature_names_out(self.categorical_cols)
            encoded_df = pd.DataFrame(encoded_cats, columns=cat_cols, index=df.index)
            df = pd.concat([df.drop(columns=self.categorical_cols), encoded_df], axis=1)
            
        return df[self.get_feature_names()]

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        # Same steps as fit_transform but without fitting
        df = df.copy()
        # For transform, we assume missing values should be handled using already fitted imputers
        if self.numerical_cols:
            df[self.numerical_cols] = self.num_imputer.transform(df[self.numerical_cols])
        if self.categorical_cols:
            df[self.categorical_cols] = self.cat_imputer.transform(df[self.categorical_cols])
            
        if self.numerical_cols:
            df[self.numerical_cols] = self.scaler.transform(df[self.numerical_cols])
            
        if self.categorical_cols:
            encoded_cats = self.encoder.transform(df[self.categorical_cols])
            cat_cols = self.encoder.get_feature_names_out(self.categorical_cols)
            encoded_df = pd.DataFrame(encoded_cats, columns=cat_cols, index=df.index)
            df = pd.concat([df.drop(columns=self.categorical_cols), encoded_df], axis=1)
            
        return df[self.get_feature_names()]

    def get_feature_names(self):
        cat_features = list(self.encoder.get_feature_names_out(self.categorical_cols)) if self.categorical_cols else []
        return self.numerical_cols + cat_features

    def save(self, directory: str, version_tag: str = None):
        import json
        os.makedirs(directory, exist_ok=True)
        if version_tag:
            filename = f"preprocessor_{version_tag}.joblib"
        else:
            filename = "preprocessor.joblib"
        joblib.dump(self, os.path.join(directory, filename))

    @classmethod
    def load(cls, directory: str, version_tag: str = None):
        if version_tag:
            filename = f"preprocessor_{version_tag}.joblib"
        else:
            filename = "preprocessor.joblib"
            
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            return joblib.load(path)
            
        # Fallback to old loading method if single file doesn't exist
        instance = cls()
        instance.scaler = joblib.load(os.path.join(directory, 'scaler.joblib'))
        instance.encoder = joblib.load(os.path.join(directory, 'encoder.joblib'))
        instance.num_imputer = joblib.load(os.path.join(directory, 'num_imputer.joblib'))
        instance.cat_imputer = joblib.load(os.path.join(directory, 'cat_imputer.joblib'))
        import json
        with open(os.path.join(directory, 'preprocessor_cols.json'), 'r') as f:
            cols = json.load(f)
            instance.numerical_cols = cols.get("numerical_cols", [])
            instance.categorical_cols = cols.get("categorical_cols", [])
        return instance

def split_data(df: pd.DataFrame, target_col: str, test_size: float = 0.2, random_state: int = 42):
    X = df.drop(columns=[target_col])
    y = df[target_col]
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
