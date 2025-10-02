# RNN for Sentiment Analysis (embedding)

import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Embedding, SimpleRNN, Dense
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.datasets import imdb

# Load and preprocess data
vocab_size, max_length = 10000, 200
(x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=vocab_size)
x_train = pad_sequences(x_train, maxlen=max_length, padding='post')
x_test = pad_sequences(x_test, maxlen=max_length, padding='post')

# Build and train model
model = Sequential([
    Embedding(vocab_size, 128, input_length=max_length),
    SimpleRNN(64, activation='relu'),
    Dense(1, activation='sigmoid')
])
model.compile(optimizer=tf.keras.optimizers.Adam(0.0005),
              loss='binary_crossentropy',
              metrics=['accuracy'])
model.fit(x_train, y_train, epochs=10, batch_size=64, validation_data=(x_test, y_test))

# Evaluate
loss, accuracy = model.evaluate(x_test, y_test)
print(f"Test Accuracy: {accuracy:.4f}")

# Predict
sample = ["this movie was fantastic"]
sample_seq = tf.keras.preprocessing.text.text_to_word_sequence(sample[0])
sample_idx = [[imdb.get_word_index().get(word, 0) for word in sample_seq if imdb.get_word_index().get(word, 0) < vocab_size]]
sample_pad = pad_sequences(sample_idx, maxlen=max_length)
print("Sentiment:", "Positive" if model.predict(sample_pad) > 0.5 else "Negative")