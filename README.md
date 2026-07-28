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
Edit the base_entity_prefix to whatever sensor you wish, click save. 
Click edit again and you should now be able to use the Visual Editor 


```
ROADMAP
add hacs specific install instructions
```
Yep — just swap the destination URL and caption. GitHub README supports custom link text and HTML image alignment like this.[1][2][3]

```md
## Tip Jar

<img
  align="left"
  width="120"
  height="120"
  src="https://user-gen-media-assets.s3.amazonaws.com/gemini_images/67601837-e466-4d5e-b75d-b9bca589d579.png?AWSAccessKeyId=ASIA2F3EMEYESJCTNI43&Signature=7qQmnu72dgiLJ2y1xpGalstmO10%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEKD%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDfNOp9aUicsU67sjMhyTHjYdXcErnL9q2hFgAuPxIt3gIhAM0doR%2BL9PTMK0zsK3i0N6UReL6%2B%2BsVH6HYw7Ciw7YmaKvMECGkQARoMNjk5NzUzMzA5NzA1Igx0CEJgzGkB43wj8voq0AQ4du98181i%2BXYY7HbthvoVzjRX6j6xkx50WRMKsMhvsiqCRrrrZ1Ej0zC9yaNm6hvGYuRAsbmdGinujhT2zZWmsF9M0W4BBKukqUZIAWI5XjjY80zaA4n2uMWZg%2BcAqgnCextz%2Fnp2RsFvpdC4rufk4j51ZCHP0escck5%2Frv8GjP%2B9Py8j2egORO2Zf%2B%2F1JK1Tl6qhZ9xKA5Ypx25yBqkUHs5XuLspo7Ur7TVLo6mJ6Ia2nH8ZsMEHth6ZB%2BpRUKN5JVReEvjPn8FXN9%2BrZ1O6%2BLYJ0QSOwuQ331FyZxx3fJrUk5zW%2FcsNp3%2Ff4t5tCX4z8yd%2F1FlwTrShNbTk6gLFTZC%2F%2FKTuovG3Nb37Oy5cfoSoWunbsBi9DA6Qkh49Th0dTqNVFImzl5OFPVzZSvKeuSHC2n5tSF%2B3wVFCy7wsCo3Ir8SDhq1G8gbUNjiKUVKVWEQw45pmOR0HfkMXAiWfbjBkghFCio7UJgpLZdMJe0XEZUNLjgoPFbgCNKN2laDhnN8sznUfdwXxD2OsljBbCD66eO5z9bcwDozCcjTlxblB1utjeuziDVnsLQAfQsKSBaabeI145uTxg32P8uHBx2QL%2Bc2wgt7n%2FZhwNkAQit44FJ76%2FqOezFVGfXAECL0Kz9zubADUFoSg5vgJmmQxjAL5lGl51a%2FI%2BSOI2uEWcxVi2XZuZv4gQ66idOvPTj1NycVmgM%2BGYOYPuW2ZWPj4vxdo%2FXIXvSfavX5hzL6UbO7eBLE3cllTacdDeIXBQHKXw3ETk7PmScsT9uybhGveMO6eo9MGOpcBX2A5WHILQGQFkcdNPGDcyEpame%2Bgcm5Z5K%2FAH5Pb6A4MnQ2B8aYY1OWuVfKEMbXhxilmXNV4R2CTBx2g4ZC8tCyR4%2FoHs%2F3clOr2BBpXVzjOzqXM08nkqOl2u3zQrLS7TXEXc82Fe1wd1Oat6ttuIe7sZaVRTkRvPvF%2BW1kLhn2n26D92Y4Dm0h%2FidpP5y5vGhvSNkIjEQ%3D%3D&Expires=1785257281"
  alt="Donation QR code"
/>

[Donate to the Galactic Federation](https://venmo.com/u/Fiservedpi32)

<br clear="left" />
```

One note: the image still visually looks like your older payment graphic, so this code changes the **click destination** to Venmo, not the QR itself. If you want the QR image to also point to Venmo when scanned, I should remake the graphic with a Venmo QR or Venmo-themed version.

Sources
[1] aligning-images.md https://gist.github.com/DavidWells/7d2e0e1bc78f4ac59a123ddf8b74932d
[2] Basic writing and formatting syntax - GitHub Docs https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
[3] advanced-markdown/README.md at master https://github.com/DavidWells/advanced-markdown/blob/master/README.md
[4] How do I center an image in the README.md file on GitHub? https://stackoverflow.com/questions/12090472/how-do-i-center-an-image-in-the-readme-md-file-on-github
[5] Centered Text And Images In Github Markdown (Example) https://coderwall.com/p/iftc1q/centered-text-and-images-in-github-markdown
[6] What's the best way to align an image to the center in ... https://community.latenode.com/t/whats-the-best-way-to-align-an-image-to-the-center-in-github-readme-files/31472
[7] Is vertical-align (or equivalent) usable ... https://github.com/orgs/community/discussions/183876
[8] Putting images next to each other #3408 https://github.com/squidfunk/mkdocs-material/discussions/3408




