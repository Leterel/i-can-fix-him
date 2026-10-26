# I Can Fix Him 0.4.0 starten

Mit Node.js 22+ Start-Spiel.cmd öffnen, dann http://127.0.0.1:8841 besuchen.
Für die App sind keine npm-Pakete erforderlich. Server mit Strg+C beenden.

WASD/Pfeile bewegen, E redet, F schubst, 1–3 wählen Dialogantworten.
Auf Touchgeräten stehen Steuerkreuz und Aktionsbuttons bereit.
P oder „Pause“ hält Spielzeit, Bewegung und Cooldown an. Mit „Schicht fortsetzen“
oder P bewusst weiterlaufen lassen; Escape im Pausemenü setzt ebenfalls fort.
Beim Verlassen des Tabs pausiert die App. Rückkehr läuft nicht automatisch weiter.
Speichern, Laden und Export sind auch im Pausemenü möglich. Laden hält die Pause;
erst bewusstes Fortsetzen öffnet den gespeicherten Dialog oder Schichtbericht.
Pause selbst ist kein Savefeld: Nach Neuladen lädt nur der manuell gespeicherte Stand.
„Bezirksplan & freiwillige Ziele“ zeigt dich gelb, dein Ziel orange, Gebäude grau
und die vier NPCs mit Anfangsbuchstaben. Namen anklicken: Der Wegweiser nennt
die Richtung oder Gesprächsreichweite. Die Karte bewegt dich nicht automatisch;
um Gebäude herumgehen. Auf kleinen Bildschirmen den Plan zuerst aufklappen.
Die Ziele erklären drei unterschiedliche Grenzen, Kioskfolgen und Unruhepauschale.
Sie werden aus der laufenden Schicht abgeleitet und verändern keine Spielregeln.
Von der Startposition nach links oben zu Ronny gehen. Drei unterschiedliche
Grenzen bei NPCs ermöglichen Feierabend. Entscheidungen haben Konsequenzen.

Lokal speichern hält den aktuellen Stand fest. Neuladen stellt diesen Stand
wieder her; spätere Änderungen erfordern erneutes Speichern. Export lädt eine
JSON-Sicherung herunter. Import übernimmt eine gültige Datei, danach bei Bedarf
lokal speichern. Ungültige Dateien lassen die Schicht unverändert. Neu anfangen
löscht den lokalen Speicherplatz. Exportierte Dateien bleiben bei dir.

Gleiche Browseradresse und gleiches Profil verwenden. Browserreinigung kann den
lokalen Stand löschen; vorher exportieren. Kein Cloudkonto, keine Serverübertragung.
Touchprüfung erfolgte in Chrome-Emulation, nicht auf einem physischen Handy.
Spielbarer Prototyp, kein fertiges Vollspiel.

Quellen: https://github.com/Leterel/i-can-fix-him
