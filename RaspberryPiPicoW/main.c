#include "lib/utils.h"

int main() {
    init_hardware();
    server_init(); 
    generate_client_id(client_id_buf, sizeof(client_id_buf)); 
    configure_mqtt_client(&state, client_id_buf); 
    resolve_and_connect_mqtt(&state); 
    
    while (verify_mqtt(&state)){
        cyw43_arch_poll(); 
        cyw43_arch_wait_for_work_until(make_timeout_time_ms(10000)); 
        printf("Reading sensors...\n");
        SensorReadings readings = get_sensor_readings();
    }
    printf("MQTT connection lost\n");
    cyw43_arch_deinit();
    return 0;
}