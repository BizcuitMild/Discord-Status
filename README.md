# Discord Status

* [การติดตั้ง](#การติดตั้ง)
* [การใช้งาน](#การใช้งาน)
* [หมดเวลา / เวลาต่อคีย์เฟรม](#หมดเวลา--เวลาต่อคีย์เฟรม)
* [Custom Javascript](#custom-javascript)

## การติดตั้ง
ติดตั้ง [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp)\
ดาวน์โหลด [Discord_Status.plugin.js](/Discord_Status.plugin.js?raw=true) ลงในโฟลเดอร์ต่อไปนี้\
Mac: `~/Library/Preferences/BetterDiscord`\
Windows: `%appdata%\BetterDiscord\plugins`\
Linux: `~/.config/BetterDiscord/plugins`

## การใช้งาน
เปิด Discord ไปที่ Settings\>Plugins, เปิดใช้งาน DiscordStatus และคลิกที่ Settings.\
ป้อนข้อความหรือข้อมูลที่จำเป็นลงในช่องป้อนข้อมูลและคลิก `save`

## หมดเวลา / เวลาต่อคีย์เฟรม
ค่านี้ระบุความยาวของแต่ละขั้นตอนการเคลื่อนไหวเป็นมิลลิวินาที
ตัวอย่าง: เมื่อหมดเวลา 2,000 ภาพเคลื่อนไหวต่อไปนี้จะใช้เวลา 4 วินาทีจึงจะเสร็จสมบูรณ์
```
"abc"
"def"
```
ระยะหมดเวลาของภาพเคลื่อนไหวควรมีอย่างน้อย 2900 มิลลิวินาทีเพื่อให้ภาพเคลื่อนไหวดูราบรื่นบนไคลเอนต์อื่น ๆ ซึ่งจะช่วยให้มั่นใจได้ว่าจะไม่มีคีย์เฟรมสูญหาย
ในระบบมือถืออาจต้องตั้งค่าระยะหมดเวลาให้สูงขึ้นเล็กน้อย (10-14 วินาที)

### Custom Javascript
เวลาปัจจุบันเป็นสถานะของคุณ:
![Settings Page](https://i.ibb.co/P4KwHmG/statusclock.png)
```
"eval let fmt=t=>(t<10?'0':'')+t;let d=new Date();`${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(d.getSeconds())}`;"
```

เวลาปัจจุบันและอิโมจินาฬิกาเป็นสถานะปัจจุบันของคุณ:
![Settings Page](https://i.ibb.co/tKg7nM6/status-clock.png)
```
"eval let fmt=t=>(t<10?'0':'')+t;let d=new Date();`${fmt(d.getHours())}:${fmt(d.getMinutes())}:${fmt(d.getSeconds())}`;", "eval ['🕛','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚'][((new Date()).getHours()%12)];"
```
