# ibe-api

Hi Rob - this payload adds a single new player (called 'new player' and with add-date 12/10/23) to the existing database. The 'A'  in 'A 12/10/23' means add a player. There are similar commands for deleting and renaming, I think 'D' and 'R'. There can be multiple pdwscript elements as children of the pdwrequest I think.

```xml
<?xml version: "1.0" encoding="ISO-8859-1"?>
<pdwrequest svs="-v-10126j-v-teamdum" pass="cat" remrev="139">
 <pdwscript itemtype="player"><![CDATA[A 12/10/23 new player
]]>
 </pdwscript>
</pdwrequest>
```