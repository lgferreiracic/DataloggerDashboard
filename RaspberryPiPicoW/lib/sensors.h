#ifndef SENSORS_H
#define SENSORS_H

#include "aht20.h"
#include "bmp280.h"
#include "mpu6050.h"

#define I2C_PORT i2c0
#define I2C_SDA 0
#define I2C_SCL 1
#define SEA_LEVEL_PRESSURE 101925.0

typedef struct {
    float temperature;
    float humidity;
    float altitude;
    float gyroscope;
    float acceleration;
    float gyroscope_x;
    float gyroscope_y;
    float gyroscope_z;
    float acceleration_x;
    float acceleration_y;
    float acceleration_z;
    char timestamp[20];
} SensorReadings;

void init_i2c_sensor(void);
void init_bmp280();
void init_aht20();
SensorReadings get_sensor_readings();
double calculate_altitude(double pressure);

#endif
