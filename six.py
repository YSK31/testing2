# MLP CLassifier

import time
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

# Load data
data = load_digits()
X, y = data.data, data.target

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, 
                                                    test_size=0.2, random_state=42)

# Feature scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Model
model = MLPClassifier(hidden_layer_sizes=(200, 200),
                      activation='relu',
                      solver='adam',
                      batch_size=32,
                      max_iter=200,
                      learning_rate_init=0.01,
                      random_state=42)

# Training with timing
start_time = time.time()
model.fit(X_train, y_train)
training_time = time.time() - start_time

# Predictions and evaluation
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

train_acc = accuracy_score(y_train, y_pred_train)
test_acc = accuracy_score(y_test, y_pred_test)

# Output results
print(f"Training Accuracy = {train_acc * 100 :.2f} %")
print(f"Testing Accuracy  = {test_acc * 100 :.2f} %")
print(f"Training Time     = {training_time:.4f} seconds")