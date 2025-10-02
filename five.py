# GAN

import tensorflow as tf
import matplotlib.pyplot as plt

# Load and preprocess MNIST data
(x_train, _), _ = tf.keras.datasets.mnist.load_data()
x_train = x_train.astype("float32") / 255.0
x_train = x_train.reshape(-1, 28, 28, 1)

BUFFER_SIZE = 60000
BATCH_SIZE = 128
LATENT_DIM = 100
EPOCHS = 50
dataset = tf.data.Dataset.from_tensor_slices(x_train).shuffle(BUFFER_SIZE).batch(BATCH_SIZE)

# Generator and Discriminator models
generator = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(LATENT_DIM,)),
    tf.keras.layers.Dense(784, activation='tanh'),
    tf.keras.layers.Reshape((28, 28))
])

discriminator = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=(28, 28)),
    tf.keras.layers.Dense(128, activation='leaky_relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# Optimizers and Loss
cross_entropy = tf.keras.losses.BinaryCrossentropy()
gen_optimizer = tf.keras.optimizers.Adam(1e-4)
disc_optimizer = tf.keras.optimizers.Adam(1e-4)

# Training function
@tf.function
def train_step(images):
    noise = tf.random.normal([BATCH_SIZE, LATENT_DIM])
    with tf.GradientTape() as gen_tape, tf.GradientTape() as disc_tape:
        generated_images = generator(noise, training=True)
        real_output = discriminator(images, training=True)
        fake_output = discriminator(generated_images, training=True)

        gen_loss = cross_entropy(tf.ones_like(fake_output), fake_output)
        disc_loss = cross_entropy(tf.ones_like(real_output), real_output) + cross_entropy(
                                                                                        tf.zeros_like(fake_output), fake_output)

    gradients_of_generator = gen_tape.gradient(gen_loss, generator.trainable_variables)
    gradients_of_discriminator = disc_tape.gradient(disc_loss, discriminator.trainable_variables)

    gen_optimizer.apply_gradients(zip(gradients_of_generator, generator.trainable_variables))
    disc_optimizer.apply_gradients(zip(gradients_of_discriminator, discriminator.trainable_variables))

    return gen_loss, disc_loss

# Train GAN and generate images
def train(dataset, epochs):
    for epoch in range(epochs):
        for image_batch in dataset:
            gen_loss, disc_loss = train_step(image_batch)
        if (epoch + 1) % 10 == 0:
            generate_and_plot_images(generator)

# Generate and plot images
def generate_and_plot_images(model, n=16):
    noise = tf.random.normal([n, LATENT_DIM])
    gen_images = model(noise, training=False)
    gen_images = (gen_images + 1) / 2.0  # Rescale to [0, 1]

    plt.figure(figsize=(4, 4))
    for i in range(n):
        plt.subplot(4, 4, i+1)
        plt.imshow(gen_images[i], cmap='gray')
        plt.axis('off')
        print("---")
    plt.tight_layout()
    plt.show()

# Start training
train(dataset, EPOCHS)
