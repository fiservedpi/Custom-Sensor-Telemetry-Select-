# Custom-Sensor-Telemetry-Select-
Custom Telemtry Card for Home Assistant
now supports a sensor picker and dynamically chooses the display style per sensor based on sensor metadata, units, names, and whether the value is numeric or text. That matches Home Assistant’s custom card model, where the frontend card can inspect entity state/attributes and render different UI based on what it finds.

The card now:

•	accepts either a  base_entity_prefix  or an explicit sensor list,

•	shows a checkbox-based sensor picker in the card,

•	auto-classifies sensors into temperature, usage, power, memory, speed, bandwidth, counters, numeric metrics, or status,
and picks the best tile style automatically, such as bar + sparkline for percentages, sparkline-only for temps/speeds, or status tiles for text sensors


How classification works It looks at:

•	unit_of_measurement

•	entity/friendly name patterns like  temp ,  utilisation ,  power ,  clock ,  download ,  upload ,  codec ,  session ,  state , and whether the state is numeric. That lets one card work for GPU telemetry, other device telemetry, and mixed sensor sets without hardcoding every suffix.

<img width="1290" height="886" alt="image" src="https://github.com/user-attachments/assets/684bad19-a314-453e-bbc0-732a0a8948bd" />
<img width="1290" height="2282" alt="image" src="https://github.com/user-attachments/assets/824ff2f6-d92d-4710-9525-7285a2ad9ec2" />
<img width="1290" height="2492" alt="image" src="https://github.com/user-attachments/assets/2463f3a1-97c9-4c8a-97ba-e0edb1d4fa6c" />

