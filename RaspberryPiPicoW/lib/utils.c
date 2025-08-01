#include "utils.h"

ssd1306_t ssd;  // Variável global para armazenar as configurações do display
volatile uint32_t last_button_press_time = 0;
MQTT_CLIENT_DATA_T state;
char client_id_buf[sizeof(MQTT_DEVICE_NAME) + 4]; // 4 chars + '\0'

/**
 * @brief Função para gerenciar a interrupção dos botões
 * @param gpio Pino do botão
 * @param events Eventos da interrupção
 */
void irq_handler(uint gpio, uint32_t events){
    if (debounce(&last_button_press_time)){
        if (gpio == BUTTON_A_PIN){
            ssd1306_clear(&ssd); // Limpa o display
            reset_usb_boot(0, 0); // Reinicia o dispositivo
        }
    }
}

/**
 * @brief Inicializa os sensores e dispositivos
 */
void init_hardware(void) {
    stdio_init_all(); // Inicializa o console
    sleep_ms(5000); // Aguarda 5 segundos para o console ser inicializado

    display_init(&ssd); // Inicializa o display
    start_display(&ssd);

    button_init_all(); // Inicializa os botões
    gpio_set_irq_enabled_with_callback(BUTTON_A_PIN, GPIO_IRQ_EDGE_FALL, true, &irq_handler);
    gpio_set_irq_enabled_with_callback(BUTTON_B_PIN, GPIO_IRQ_EDGE_FALL, true, &irq_handler);
    gpio_set_irq_enabled_with_callback(JOYSTICK_BUTTON_PIN, GPIO_IRQ_EDGE_FALL, true, &irq_handler);

    led_init_all(); // Inicializa os LEDs

    buzzer_init_all(); // Inicializa os buzzers

    init_mpu6050(); // Inicializa o MPU6050
    init_bmp280(); // Inicializa o BMP280
    init_aht20(); // Inicializa o AHT20

    printf("\033[2J\033[H"); // Limpa tela
    printf("\n> ");
    stdio_flush();

    white();   //Hardware OK
    play_success_sound();
    black();
    printf("Hardware OK\n");
}

// Publicar temperatura
void publish_temperature(MQTT_CLIENT_DATA_T *state) {
    static float old_temperature;
    const char *temperature_key = full_topic(state, "/temperature");
    float temperature = get_sensor_readings().temperature;
    if (temperature != old_temperature) {
        old_temperature = temperature;
        // Publish temperature on /temperature topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", temperature);
        INFO_printf("Publishing %s to %s\n", temp_str, temperature_key);
        mqtt_publish(state->mqtt_client_inst, temperature_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}


// Publicar temperatura
void temperature_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_temperature(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t temperature_worker = { .do_work = temperature_worker_fn };

// Publicar temperatura
void publish_humidity(MQTT_CLIENT_DATA_T *state) {
    static float old_humidity;
    const char *humidity_key = full_topic(state, "/humidity");
    float humidity = get_sensor_readings().humidity;
    if (humidity != old_humidity) {
        old_humidity = humidity;
        // Publish humidity on /humidity topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", humidity);
        INFO_printf("Publishing %s to %s\n", temp_str, humidity_key);
        mqtt_publish(state->mqtt_client_inst, humidity_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}


// Publicar humidade
void humidity_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_humidity(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t humidity_worker = { .do_work = humidity_worker_fn };

//Publicar altitude
void publish_altitude(MQTT_CLIENT_DATA_T *state) {
    static float old_altitude;
    const char *altitude_key = full_topic(state, "/altitude");
    float altitude = get_sensor_readings().altitude;
    if (altitude != old_altitude) {
        old_altitude = altitude;
        // Publish altitude on /altitude topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", altitude);
        INFO_printf("Publishing %s to %s\n", temp_str, altitude_key);
        mqtt_publish(state->mqtt_client_inst, altitude_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar altitude
void altitude_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_altitude(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t altitude_worker = { .do_work = altitude_worker_fn };

//Publicar aceleração
void publish_acceleration(MQTT_CLIENT_DATA_T *state) {
    static float old_acceleration;
    const char *acceleration_key = full_topic(state, "/acceleration/total");
    float acceleration = get_sensor_readings().acceleration;
    if (acceleration != old_acceleration) {
        old_acceleration = acceleration;
        // Publish acceleration on /acceleration topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", acceleration);
        INFO_printf("Publishing %s to %s\n", temp_str, acceleration_key);
        mqtt_publish(state->mqtt_client_inst, acceleration_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar aceleração
void acceleration_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_acceleration(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t acceleration_worker = { .do_work = acceleration_worker_fn };

//Publicar giroscópio
void publish_gyroscope(MQTT_CLIENT_DATA_T *state) {
    static float old_gyroscope;
    const char *gyroscope_key = full_topic(state, "/gyroscope/total");
    float gyroscope = get_sensor_readings().gyroscope;
    if (gyroscope != old_gyroscope) {
        old_gyroscope = gyroscope;
        // Publish gyroscope on /gyroscope topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", gyroscope);
        INFO_printf("Publishing %s to %s\n", temp_str, gyroscope_key);
        mqtt_publish(state->mqtt_client_inst, gyroscope_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar giroscópio
void gyroscope_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_gyroscope(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t gyroscope_worker = { .do_work = gyroscope_worker_fn };

// Publicar aceleração X
void publish_acceleration_x(MQTT_CLIENT_DATA_T *state) {
    static float old_acceleration_x;
    const char *acceleration_x_key = full_topic(state, "/acceleration/x");
    float acceleration_x = get_sensor_readings().acceleration_x;
    if (acceleration_x != old_acceleration_x) {
        old_acceleration_x = acceleration_x;
        // Publish acceleration_x on /acceleration/x topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", acceleration_x);
        INFO_printf("Publishing %s to %s\n", temp_str, acceleration_x_key);
        mqtt_publish(state->mqtt_client_inst, acceleration_x_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar aceleração X
void acceleration_x_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_acceleration_x(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t acceleration_x_worker = { .do_work = acceleration_x_worker_fn };

// Publicar aceleração Y
void publish_acceleration_y(MQTT_CLIENT_DATA_T *state) {
    static float old_acceleration_y;
    const char *acceleration_y_key = full_topic(state, "/acceleration/y");
    float acceleration_y = get_sensor_readings().acceleration_y;
    if (acceleration_y != old_acceleration_y) {
        old_acceleration_y = acceleration_y;
        // Publish acceleration_y on /acceleration/y topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", acceleration_y);
        INFO_printf("Publishing %s to %s\n", temp_str, acceleration_y_key);
        mqtt_publish(state->mqtt_client_inst, acceleration_y_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar aceleração Y
void acceleration_y_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_acceleration_y(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t acceleration_y_worker = { .do_work = acceleration_y_worker_fn };

// Publicar aceleração Z
void publish_acceleration_z(MQTT_CLIENT_DATA_T *state) {
    static float old_acceleration_z;
    const char *acceleration_z_key = full_topic(state, "/acceleration/z");
    float acceleration_z = get_sensor_readings().acceleration_z;
    if (acceleration_z != old_acceleration_z) {
        old_acceleration_z = acceleration_z;
        // Publish acceleration_z on /acceleration/z topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", acceleration_z);
        INFO_printf("Publishing %s to %s\n", temp_str, acceleration_z_key);
        mqtt_publish(state->mqtt_client_inst, acceleration_z_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar aceleração Z
void acceleration_z_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_acceleration_z(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t acceleration_z_worker = { .do_work = acceleration_z_worker_fn };

// Publicar giroscópio X
void publish_gyroscope_x(MQTT_CLIENT_DATA_T *state) {
    static float old_gyroscope_x;
    const char *gyroscope_x_key = full_topic(state, "/gyroscope/x");
    float gyroscope_x = get_sensor_readings().gyroscope_x;
    if (gyroscope_x != old_gyroscope_x) {
        old_gyroscope_x = gyroscope_x;
        // Publish gyroscope_x on /gyroscope/x topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", gyroscope_x);
        INFO_printf("Publishing %s to %s\n", temp_str, gyroscope_x_key);
        mqtt_publish(state->mqtt_client_inst, gyroscope_x_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar giroscópio X
void gyroscope_x_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_gyroscope_x(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t gyroscope_x_worker = { .do_work = gyroscope_x_worker_fn };

// Publicar giroscópio Y
void publish_gyroscope_y(MQTT_CLIENT_DATA_T *state) {
    static float old_gyroscope_y;
    const char *gyroscope_y_key = full_topic(state, "/gyroscope/y");
    float gyroscope_y = get_sensor_readings().gyroscope_y;
    if (gyroscope_y != old_gyroscope_y) {
        old_gyroscope_y = gyroscope_y;
        // Publish gyroscope_y on /gyroscope/y topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", gyroscope_y);
        INFO_printf("Publishing %s to %s\n", temp_str, gyroscope_y_key);
        mqtt_publish(state->mqtt_client_inst, gyroscope_y_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar giroscópio Y
void gyroscope_y_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_gyroscope_y(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t gyroscope_y_worker = { .do_work = gyroscope_y_worker_fn };

// Publicar giroscópio Z
void publish_gyroscope_z(MQTT_CLIENT_DATA_T *state) {
    static float old_gyroscope_z;
    const char *gyroscope_z_key = full_topic(state, "/gyroscope/z");
    float gyroscope_z = get_sensor_readings().gyroscope_z;
    if (gyroscope_z != old_gyroscope_z) {
        old_gyroscope_z = gyroscope_z;
        // Publish gyroscope_z on /gyroscope/z topic
        char temp_str[16];
        snprintf(temp_str, sizeof(temp_str), "%.2f", gyroscope_z);
        INFO_printf("Publishing %s to %s\n", temp_str, gyroscope_z_key);
        mqtt_publish(state->mqtt_client_inst, gyroscope_z_key, temp_str, strlen(temp_str), MQTT_PUBLISH_QOS, MQTT_PUBLISH_RETAIN, pub_request_cb, state);
    }
}

// Publicar giroscópio Z
void gyroscope_z_worker_fn(async_context_t *context, async_at_time_worker_t *worker) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)worker->user_data;
    publish_gyroscope_z(state);
    async_context_add_at_time_worker_in_ms(context, worker, TEMP_WORKER_TIME_S * 1000);
}

async_at_time_worker_t gyroscope_z_worker = { .do_work = gyroscope_z_worker_fn };


/*
 * @brief Callback function for MQTT connection status
 * @param client Pointer to MQTT client
 * @param arg Pointer to user data
 * @param status Connection status
 */
void mqtt_connection_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
    MQTT_CLIENT_DATA_T* state = (MQTT_CLIENT_DATA_T*)arg;
    if (status == MQTT_CONNECT_ACCEPTED) {
        state->connect_done = true;
        sub_unsub_topics(state, true); // subscribe;

        // indicate online
        if (state->mqtt_client_info.will_topic) {
            mqtt_publish(state->mqtt_client_inst, state->mqtt_client_info.will_topic, "1", 1, MQTT_WILL_QOS, true, pub_request_cb, state);
        }

        
        // Publish temperature every 10 sec if it's changed
        temperature_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &temperature_worker, 0);

        // Publish humidity every 10 sec if it's changed
        humidity_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &humidity_worker, 0);

        // Publish altitude every 10 sec if it's changed
        altitude_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &altitude_worker, 0);

        // Publish acceleration every 10 sec if it's changed
        acceleration_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &acceleration_worker, 0);

        // Publish gyroscope every 10 sec if it's changed
        gyroscope_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &gyroscope_worker, 0);

        // Publish acceleration_x every 10 sec if it's changed
        acceleration_x_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &acceleration_x_worker, 0);

        // Publish acceleration_y every 10 sec if it's changed
        acceleration_y_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &acceleration_y_worker, 0);

        // Publish acceleration_z every 10 sec if it's changed
        acceleration_z_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &acceleration_z_worker, 0);

        // Publish gyroscope_x every 10 sec if it's changed
        gyroscope_x_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &gyroscope_x_worker, 0);

        // Publish gyroscope_y every 10 sec if it's changed
        gyroscope_y_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &gyroscope_y_worker, 0);

        // Publish gyroscope_z every 10 sec if it's changed
        gyroscope_z_worker.user_data = state;
        async_context_add_at_time_worker_in_ms(cyw43_arch_async_context(), &gyroscope_z_worker, 0);
        

    } else if (status == MQTT_CONNECT_DISCONNECTED) {
        if (!state->connect_done) {
            panic("Failed to connect to mqtt server");
        }
    }
    else {
        panic("Unexpected status");
    }
}
