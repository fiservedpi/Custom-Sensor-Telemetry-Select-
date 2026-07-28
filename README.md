# Custom-Sensor-Telemetry-Select
<img width="2048" height="2048" alt="image" src="https://github.com/user-attachments/assets/08f48be1-9fba-454f-bc12-47500d63e3e5" />

Custom Telemetry Card for Home Assistant
now supports a sensor picker and dynamically chooses the display style per sensor based on sensor metadata, units, names, and whether the value is numeric or text. That matches Home Assistant’s custom card model, where the frontend card can inspect entity state/attributes and render different UI based on what it finds!

The card now:

•	accepts either a  ```base_entity_prefix```  or an ```explicit sensor list```

•	shows a checkbox-based sensor picker in the card,

•	auto-classifies sensors into temperature, usage, power, memory, speed, bandwidth, counters, numeric metrics, or status,
and picks the best tile style automatically, such as bar + sparkline for percentages, sparkline-only for temps/speeds, or status tiles for text sensors


How classification works It looks at:

•	unit_of_measurement

•	entity/friendly name patterns like  temp ,  utilisation ,  power ,  clock ,  download ,  upload ,  codec ,  session ,  state , and whether the state is numeric. That lets one card work for GPU telemetry, other device telemetry, and mixed sensor sets without hardcoding every suffix.

<img width="1290" height="886" alt="image" src="https://github.com/user-attachments/assets/684bad19-a314-453e-bbc0-732a0a8948bd" />
<img width="1290" height="2282" alt="image" src="https://github.com/user-attachments/assets/824ff2f6-d92d-4710-9525-7285a2ad9ec2" />
<img width="1290" height="2492" alt="image" src="https://github.com/user-attachments/assets/2463f3a1-97c9-4c8a-97ba-e0edb1d4fa6c" />

Quick Setup

Download gpu-telemetry-helper-cardv1.js and copy it to the /www/ folder inside your ha config

Add the resource to your ha front end (edit 3dots manage resources add resource 
```
URL: /www/gpu-telemetry-helper-cardv1.js
TYPE: JavaScript module
```

REBOOT HA 

Add a new manual card to your front end
```
type: custom:gpu-telemetry-helper-card
title: Tower GPU Telemetry
device_name: Nvidia GTX 1650
base_entity_prefix: sensor.nvidia_geforce_gtx_1650_tower_gpu0_
accent_color: "#ff8c42"
sensor_picker: true
history_hours: 6
use_real_history: true
show_sparklines: true
compact: false
group_by_type: true
shared_scale: true
show_range_controls: true
mode_overrides_text: |
  sensor.nvidia_geforce_gtx_1650_tower_gpu0_power_draw=line
  sensor.nvidia_geforce_gtx_1650_tower_gpu0_encode_sessions=bar
  encode_codec=status
  gpu_utilisation=barline
```
Edit the sesnor.XXXXXX to whatever sensor you wish, click save. 
Click edit again and you should now be able to use the Visual Editor 


```
ROADMAP
add hacs specific install instructions
```


## Tip Jar

<p align="center">
  <a href="https://www.paypal.com/qrcodes/managed/3f7a84a4-212d-4f5a-8497-76da22778c55?utm_source=consapp_download" target="_blank" rel="noopener noreferrer">
    <img src="https://user-gen-media-assets.s3.amazonaws.com/gemini_images/4ae3d33a-67fe-474c-bb62-55a7b0ac9f5b.png?AWSAccessKeyId=ASIA2F3EMEYE6ENC6PNV&Signature=i%2FROF28Slh59MOxg%2Fjj7tj08o14%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHQmw0Ck8HKKyFBHdfJ2giyF4W%2B%2BLxnBFMsDRLpZXnlLAiEA7MT7PqyCJvsxUs7kAECuSAEwK%2B4RgvtoU3f92B7jwa4q8wQIaRABGgw2OTk3NTMzMDk3MDUiDHrTjl2tQQywKi%2FZwCrQBJCEGXo9atJdds0FLaAffzNTe2Z7Wezb26SggQH2%2BPc5LKwkKINA2%2FvrLYluRrSWbtSclMrQhqiOP%2FiGeCCcUugz5dXx%2FUlefOf%2BbG6i0Y%2FVEnJvkZdBhkV4xIEZn5pyU75uvNd%2FS5deYnF29jhqj9B9BTUpPpON8vgwocFy6xUlRoCEsnqV3O4Ihii1l3bVR9N7ax10sqX6WzzNB%2BPmudea3E1KdMDTsz54ofm1I%2BqzXGyAfjPtqGumTy40BBoiGP43GaVJclapO2o%2Bb9TyQqJ5%2BhXJ42rqnIfUN1ImlgM5B9%2BDzWntibLojeP6eBXiEmr4QnQ%2BC4O%2B0Rl1cnCC%2BZxfUPacKCfCbmOOq2Dbt%2BC2pwYXPhNLmMi%2BkEgUIbuJzpkstV2kdEHoaW6ZE5vT2RopEaYghHvZJgeRzZven12Goby68vtUfZjezu4ATr8zNdyD0U7vFGdxws0j24VwdK3hSULHFA5enOvEimH8z%2FUYeBP7YULXW7wqlAt%2B59im8DjUCS2eu3m4QsPkO6BtiSW7sinpROSORgkf4TBkKVtorBjEgFqUQJAQ1hqDlA8POcP9vUOMC%2FwhXgFbAlq%2FSbqPf7oTPsJud35J2zKg7bgy4jJ%2FIU3K4QXE%2BV5yeQeQtD5XjlqvailY2PZLMpp%2BJxJbrtDrh19RRKdInRChb18%2BXLl1RHpP%2Ff1wLFyfgQz%2BFrnUSjxUNP7vEDXhUDq0U9ApDTW2ax1Diro0Sde%2BGM1xFSBy%2BTwrTakASrKYUFYOlNy89a0jMvQ5YYmwSqqWcAgw3Zmj0wY6mAFl0YhjkBp4%2FeKzH2spImweNiexe7XBZOvdImZJabaUct2G4%2FrGqvGL86iwJYlkAtHCQbTYn2QR%2BQcDKvNeWFjeKGRj52QQ0rxQ1%2BpTlDUcSDLnEhrIUnkM5CXeBsVkn1RUpcuc7hTkICQKfLwLNG1iIfrPNi1ekcPfaRl9I5biXB%2FRHMOnVQJg8iDhgib2FxZ8HnXMQAAchA%3D%3D&Expires=1785256624" alt="PayPal tip jar QR code" width="320" />
  </a>
</p>

<p align="center">
  <a href="https://www.paypal.com/qrcodes/managed/3f7a84a4-212d-4f5a-8497-76da22778c55?utm_source=consapp_download" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Tip%20Jar-PayPal-003087?style=for-the-badge&logo=paypal&logoColor=white" alt="Tip me on PayPal" />
  </a>
</p>

