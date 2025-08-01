#include "sensors.h"

static struct bmp280_calib_param bmp_params;

/**
 * @brief Inicializa a comunicação I2C com os sensores
 */
void init_i2c_sensor(void) {
    i2c_init(I2C_PORT, 400 * 1000);
    gpio_set_function(I2C_SDA, GPIO_FUNC_I2C);
    gpio_set_function(I2C_SCL, GPIO_FUNC_I2C);
    gpio_pull_up(I2C_SDA);
    gpio_pull_up(I2C_SCL);
}

/**
 * @brief Inicializa o sensor BMP280
 */
void init_bmp280(void) {
    bmp280_init(I2C_PORT);
    bmp280_get_calib_params(I2C_PORT, &bmp_params);
}

/**
 * @brief Inicializa o sensor AHT20
 */
void init_aht20(void) {
    aht20_reset(I2C_PORT);
    aht20_init(I2C_PORT);
}

/**
 * @brief Inicializa o sensor MPU6050
 */
double calculate_altitude(double pressure) {
    return 44330.0 * (1.0 - pow(pressure / SEA_LEVEL_PRESSURE, 0.1903));
}

/**
 * @brief Lê os dados dos sensores
 * @return SensorReadings
 */
SensorReadings get_sensor_readings(void) {
    SensorReadings data = {0};
    AHT20_Data aht;

    // Constantes de conversão
    const float ACC_SCALE = 1.0f / 16384.0f;
    const float GYRO_SCALE = 1.0f / 131.0f;

    // --- BMP280: Temperatura, Pressão e Altitude ---
    int32_t raw_temp_bmp, raw_press;
    bmp280_read_raw(I2C_PORT, &raw_temp_bmp, &raw_press);
    int32_t bmp_temp = bmp280_convert_temp(raw_temp_bmp, &bmp_params);
    int32_t bmp_press = bmp280_convert_pressure(raw_press, raw_temp_bmp, &bmp_params);
    float bmp_temp_c = bmp_temp / 100.0f;
    float altitude_m = calculate_altitude(bmp_press);
    printf("BMP280: Temp: %.2f, Press: %d, Alt: %.2f\n", bmp_temp_c, bmp_press, altitude_m);

    // --- AHT20: Temperatura e Umidade ---
    float aht_temp = 0, aht_hum = 0;
    if (aht20_read(I2C_PORT, &aht)) {
        aht_temp = aht.temperature;
        aht_hum = aht.humidity;
    }
    printf("AHT20: Temp: %.2f, Hum: %.2f\n", aht_temp, aht_hum);

    // --- MPU6050: Aceleração e Giroscópio ---
    int16_t acc_raw[3], gyro_raw[3], temp_mpu;
    mpu6050_read_raw(acc_raw, gyro_raw, &temp_mpu);

    float acc[3], gyro[3];
    for (int i = 0; i < 3; i++) {
        acc[i] = acc_raw[i] * ACC_SCALE;
        gyro[i] = gyro_raw[i] * GYRO_SCALE;
    }

    // --- Preenchimento da estrutura ---
    data.temperature = (bmp_temp_c + aht_temp) / 2.0f;
    data.humidity = aht_hum;
    data.altitude = altitude_m;

    data.acceleration_x = acc[0];
    data.acceleration_y = acc[1];
    data.acceleration_z = acc[2];

    data.gyroscope_x = gyro[0];
    data.gyroscope_y = gyro[1];
    data.gyroscope_z = gyro[2];

    data.acceleration = sqrtf(acc[0]*acc[0] + acc[1]*acc[1] + acc[2]*acc[2]);
    data.gyroscope = sqrtf(gyro[0]*gyro[0] + gyro[1]*gyro[1] + gyro[2]*gyro[2]);

    // --- Impressão dos dados ---
    printf(
        "Temperature: %.2f °C\n"
        "Humidity: %.2f %%\n"
        "Altitude: %.2f m\n"
        "Acceleration: %.2f m/s² (X: %.2f, Y: %.2f, Z: %.2f)\n"
        "Gyroscope: %.2f rad/s (X: %.2f, Y: %.2f, Z: %.2f)\n\n",
        data.temperature, data.humidity, data.altitude,
        data.acceleration, acc[0], acc[1], acc[2],
        data.gyroscope, gyro[0], gyro[1], gyro[2]
    );

    return data;
}
