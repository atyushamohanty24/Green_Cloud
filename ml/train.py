import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import classification_report, accuracy_score, f1_score, mean_absolute_error, root_mean_squared_error, r2_score
from synthetic_generator import generate_synthetic_data

def train_model():
    print("Generating synthetic metric dataset (35 days hourly metrics)...")
    df, specs = generate_synthetic_data(days=35)
    
    # Feature Engineering
    # Compute rolling 6-hour and 24-hour aggregations per resource
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by=['resource_id', 'timestamp'])
    
    df['cpu_rolling_6h_mean'] = df.groupby('resource_id')['cpu_utilization'].transform(lambda x: x.rolling(6, min_periods=1).mean())
    df['cpu_rolling_24h_mean'] = df.groupby('resource_id')['cpu_utilization'].transform(lambda x: x.rolling(24, min_periods=1).mean())
    df['cpu_rolling_24h_max'] = df.groupby('resource_id')['cpu_utilization'].transform(lambda x: x.rolling(24, min_periods=1).max())
    df['mem_rolling_6h_mean'] = df.groupby('resource_id')['memory_utilization'].transform(lambda x: x.rolling(6, min_periods=1).mean())
    
    features = [
        'hour_of_day', 
        'day_of_week', 
        'cpu_utilization', 
        'memory_utilization', 
        'network_in_kb', 
        'network_out_kb', 
        'request_count',
        'cpu_rolling_6h_mean',
        'cpu_rolling_24h_mean',
        'cpu_rolling_24h_max',
        'mem_rolling_6h_mean'
    ]
    
    X = df[features]
    y_class = df['demand_label']
    y_reg = df['cpu_utilization']
    
    # Train-test split
    X_train, X_test, y_train_cls, y_test_cls, y_train_reg, y_test_reg = train_test_split(
        X, y_class, y_reg, test_size=0.2, random_state=42, stratify=y_class
    )
    
    print("\n--- Training Demand Classifier (Random Forest) ---")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train, y_train_cls)
    
    y_pred_cls = clf.predict(X_test)
    acc = accuracy_score(y_test_cls, y_pred_cls)
    f1 = f1_score(y_test_cls, y_pred_cls, average='weighted')
    print(f"Classification Accuracy: {acc:.4f}")
    print(f"Weighted F1-Score:      {f1:.4f}")
    print("\nClassification Report:\n", classification_report(y_test_cls, y_pred_cls))
    
    print("\n--- Training CPU Regressor (Random Forest) ---")
    reg = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    reg.fit(X_train, y_train_reg)
    
    y_pred_reg = reg.predict(X_test)
    mae = mean_absolute_error(y_test_reg, y_pred_reg)
    rmse = root_mean_squared_error(y_test_reg, y_pred_reg)
    r2 = r2_score(y_test_reg, y_pred_reg)
    print(f"Regression MAE:  {mae:.4f}% CPU")
    print(f"Regression RMSE: {rmse:.4f}% CPU")
    print(f"Regression R²:   {r2:.4f}")
    
    # Save artifacts
    model_artifact = {
        "classifier": clf,
        "regressor": reg,
        "features": features,
        "metrics": {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "mae": float(mae),
            "rmse": float(rmse),
            "r2": float(r2)
        }
    }
    
    os.makedirs("ml", exist_ok=True)
    joblib.dump(model_artifact, "ml/model.joblib")
    print("\nModel pipeline successfully trained and saved to ml/model.joblib!")

if __name__ == "__main__":
    train_model()
