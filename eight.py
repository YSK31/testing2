import numpy as np
import pandas as pd
from tensorflow.keras import Sequential
from tensorflow.keras.datasets import mnist
from tensorflow.keras.layers import Flatten, Dense, Dropout, BatchNormalization, GaussianNoise, Activation
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.optimizers import Adam
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping

(x_train, y_train),(x_test, y_test) = mnist.load_data()
x_train, x_test = x_train / 255.0 , x_test / 255.0
y_train, y_test = to_categorical(y_train, 10) , to_categorical(y_test, 10)

x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size = 0.1, random_state = 42)

def build_model(given_layers = None):
    model = Sequential([Flatten(input_shape = (28,28))])
    if given_layers:
        for layer in given_layers:
            model.add(layer)
    else:
        for _ in range(11):
            model.add(Dense(512,activation = 'relu'))
    model.add(Dense(10, activation = 'softmax'))
    return model

def train_and_evaluate(model, model_name, epochs = 10, early_stopping = False):
    callbacks = []
    if early_stopping:
        es = EarlyStopping(monitor = 'val_loss',
                          patience = 3,
                          restore_best_weight = True)
        callbacks.append(es)

    model.compile(optimizer = Adam(),
                 loss = 'categorical_crossentropy',
                 metrics = ['accuracy'])

    start_time = time.time()
    history = model.fit(x_train, y_train,
             epochs = epochs,
             validation_data = (x_val, y_val),
             batch_size=32,
             verbose=1,
             callbacks=callbacks
    )
    end_time = time.time()

    test_loss, test_acc = model.evaluate(x_test, y_test, verbose = 0)
    best_epoch = np.argmin(history.history['val_loss']) + 1

    final_train_acc = history.history['accuracy'][-1]
    final_val_acc = history.history['val_accuracy'][-1]
    overfitting_gap = final_train_acc - final_val_acc
    train_time = end_time - start_time

    return {
        'Name' : model_name,
        'Train Acc (%)' : f"{final_train_acc * 100 :.2f}",
        'Val Acc (%)' : f"{final_val_acc * 100 :.2f}",
        'Overfitting Gap (%)' : f"{overfitting_gap * 100 :.3f}",
        'Test Acc (%)' : f"{test_acc * 100 :.2f}",
        'Training Time (sec)' : f"{train_time :.4f}",
        'history' : history
    }

results = []

# Baseline
print("Training Base Line model ...")
model = build_model()
results.append(train_and_evaluate(model, "Base Line"))

# L2
print("Training L2 Regularized model ...")
model = Sequential([
    Flatten(input_shape = (28,28)),
    Dense(512, activation = 'relu', kernel_regularizer = 'l2'),
    Dense(256, activation = 'relu', kernel_regularizer = 'l2'),
    Dense(128, activation = 'relu', kernel_regularizer = 'l2'),
    Dense(10, activation = 'softmax')
])
results.append(train_and_evaluate(model, "L2"))

# Dropout
print("Training Dropout Regularized model ...")
model = Sequential([
    Flatten(input_shape = (28.28)),
    Dense(512, activation = 'relu'),
    Dropout(0.5),
    Dense(256, activation = 'relu'),
    Dropout(0.5),
    Dense(128, activation = 'relu'),
    Dense(10, activation = 'softmax')
])
results.append(train_and_evaluate(model, "Dropout"))

# Batch Normalization
print("Training Batch-Normalization model ...")
model = Sequential([
    Flatten(input_shape = (28.28)),
    Dense(512, activation = 'relu'),
    BatchNormalization(),
    Dense(256, activation = 'relu'),
    BatchNormalization(),
    Dense(128, activation = 'relu'),
    Dense(10, activation = 'softmax')
])
results.append(train_and_evaluate(model, "Batch Norm"))

# Early Stopping
print("Training Early stopping model ...")
model = build_model([
    Dense(512, activation = 'relu'),
    Dense(256, activation = 'relu'),
    Dense(128, activation = 'relu')
])
results.append(train_and_evaluate(model, "Early Stopping"))

# Noise input layer
print("Training Gaussian noise on input layer ...")
model = Sequential([
    Flatten(input_shape = (28.28)),
    GaussianNoise(0.1),
    Dense(512, activation = 'relu'),
    Dense(256, activation = 'relu'),
    Dense(128, activation = 'relu'),
    Dense(10, activation = 'softmax')
])
results.append(train_and_evaluate(model, "Noise - Input Layer"))

# Noise hidden layer
print("Training Gaussian noise on hidden layer ...")
model = Sequential([
    Flatten(input_shape = (28.28)),
    GaussianNoise(0.1),
    Dense(512, activation = 'relu'),
    GaussianNoise(0.1),
    Dense(256, activation = 'relu'),
    GaussianNoise(0.1),
    Dense(128, activation = 'relu'),
    Dense(10, activation = 'softmax')
])
results.append(train_and_evaluate(model, "Noise - Hidden Layer"))

# Noise output layer
print("Training Gaussian noise on hidden layer ...")
model = Sequential([
    Flatten(input_shape = (28.28)),
    Dense(512, activation = 'relu'),
    Dense(256, activation = 'relu'),
    Dense(128, activation = 'relu'),
    Dense(10),
    GaussianNoise(0.1),
    Activation('softmax') 
])
results.append(train_and_evaluate(model, "Noise - Hidden Layer"))


a = pd.DataFrame(results)
a