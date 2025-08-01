#ifndef UTILS_H
#define UTILS_H

#include "ssd1306.h"
#include "button.h"
#include "led_rgb.h"
#include "buzzer.h"
#include "matrix.h"
#include "web_server.h"
#include "mqtt_client.h"
#include "sensors.h"
extern ssd1306_t ssd;
extern volatile uint32_t last_button_press_time;
extern MQTT_CLIENT_DATA_T state;
extern char client_id_buf[sizeof(MQTT_DEVICE_NAME) + 4];
void init_hardware(void);

#endif
