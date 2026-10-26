# Haus der geschlagenen Frauen Simulator / I Can Fix Him — Arbeitstitel

Achte Projektidee der Zentrale, aufgenommen am 20.10.2026.
Erwachsenes, provokantes Trash-/Sandbox-Spiel mit schwarzem Humor, grotesker
Gesellschaftssatire und chaotischen Konsequenzen, inspiriert vom Ton von Postal.
Keine Übernahme fremder Assets oder Quelltexte.

## Gewählter Modus und spielbarer Stand

Der Nutzer hat **„Offene Trash-Sandbox mit absurden NPCs und Konsequenzen“**
gewählt. Implementiert ist ein lokaler Desktop-Browserprototyp: freie Bewegung
im Betonbezirk, vier erwachsene NPCs, zwölf Dialogentscheidungen, nichtgrafisches
Chaos und sichtbare soziale/finanzielle Folgen. Kein Gewalt-Speedrun.

### Start

Node.js 22 oder neuer installieren beziehungsweise vorhandene Installation nutzen.
Im Projektordner `npm start` ausführen oder unter Windows `Start-Spiel.cmd` öffnen.
Dann im Browser **http://127.0.0.1:8841** öffnen. Keine Installation von npm-Paketen
nötig, kein externer Server, keine Kosten und keine Konten.

- WASD oder Pfeiltasten: bewegen. E: mit naher Person sprechen.
- 1/2/3 oder Dialogbuttons: auswählen. Escape: Gespräch verlassen.
- F: nichtgrafisch schubsen; senkt Vertrauen, erhöht Chaos/Misstrauen und kostet Energie.
- Lokal speichern und fortsetzen; beim nächsten Öffnen wird der gespeicherte Stand geladen.
- JSON-Datei exportieren/importieren; ungültige Dateien verändern die laufende Schicht nicht.
- Touch-Steuerkreuz sowie Reden-/Schubsen-Buttons auf kleinen Touchbildschirmen.
- „Neu anfangen“ setzt die Schicht zurück und löscht den lokalen Speicherplatz.

Zum ersten Gespräch von der Startposition etwas nach links oben zu Ronny gehen.
Geld investieren oder eine Grenze setzen; Uwe weiter links oben und Mara links
unten bieten weitere Entscheidungen. Drei Grenzen bei **verschiedenen** Personen
bringen Feierabend. Anschließend lässt sich weiterspielen. Wer nur Chaos will,
kann den Kiosk schließen lassen und die Unruhepauschale kassieren. Nach wiederholtem
Schubsen verweigern NPCs Gespräche; bei null Energie endet die Schicht.

### Tests

`npm test` prüft Produktionslogik für Bewegung/Kollision, Entscheidungen, Grenzen,
Kosten, Konsequenzen und Neustart. Chrome-Browserprobe:

```powershell
$env:PLAYWRIGHT_MODULE='C:/path/to/playwright/index.mjs'
node test/browser-smoke.mjs
```

Benötigt Playwright und installiertes Google Chrome. Die Probe verwendet einen
temporären lokalen Server, echte Tastatureingaben und Screenshot-Belege. Kein
physisches Gerät. Mit `GAME_OUTPUT` lässt sich das Belegverzeichnis ändern.

## Ursprünglich diskutierte Varianten

Der ursprüngliche Arbeitstitel lautet „Haus der geschlagenen Frauen Simulator“.
Als erste Variante wurde ein Gewalt-Speedrun mit Frauen als Zielgruppe der
fiktiven Gewalt erwähnt; das ist bisher keine ausgearbeitete Mechanik.
Die zweite, weiter diskutierte Variante heißt „I Can Fix Him“: Eine Frau glaubt,
einen toxischen Partner verändern zu können. Die Beziehungs- und Gesellschafts-
satire untersucht Warnzeichen, Verdrängung, Selbsttäuschung und Konsequenzen.
Diese Varianten dokumentieren den Ursprung. Gewählt wurde danach die offene
Sandbox, wie oben beschrieben.

## Diskutierte Mechaniken

- Red-Flag-Meter für erkannte oder verdrängte Warnzeichen.
- Fix-Him-Skilltree: Zeit, Geld und emotionale Energie investieren.
- Gaslighting-Dialoge verändern die Selbstwahrnehmung der Spielfigur.
- Entscheidungen mit mehreren Enden: Trennung, weitere Eskalation oder Veränderung.
- Widersprüchliche, irrationale NPCs mit absurden Eskalationsketten.
- Konsequenzsystem; Gewalt und toxisches Verhalten sind nicht nur Punktelieferanten.
- Heruntergekommenes Viertel, dubiose Einrichtungen und korrupte Behörden.

## Stil

Absichtlich grobe PS2-Optik, übertriebene Ragdolls, derbe und trockene Kommentare.
Die Satire schließt die Spielerfigur ein. Weitere genannte Vergleichspunkte:
The Stanley Parable und Dating-Simulatoren. Vergleichspunkte sind keine Lizenzen
für deren Inhalte.

## Weitere Entwicklung

Der Prototyp nutzt Canvas mit prozedural gezeichneter, absichtlich grober
Pseudo-3D-Draufsicht und DOM-Dialogen. Ein größeres Viertel, Audio, Animationen,
ein vollständiger Inhaltsumfang bleiben Weiterentwicklung.
Desktop-Tastatur und Touchbuttons sind implementiert; kleines Bildschirmformat wurde auf Überlauf geprüft. Keine fremden Assets oder IP.
Die weiteren laufenden Projekte werden durch diese neue Idee nicht ersetzt.

## Status

Spielbarer lokaler Prototyp mit automatisierten Modell- und echten Browsertests.
Kein fertiges Vollspiel oder kommerzielles Release.
Die Arbeitstitel und Mechaniken beschreiben Fiktion, keine Anleitung zu realer Gewalt.

Die App selbst braucht keine npm-Pakete. Für reproduzierbare Browsertests kann
mit npm ci die festgelegte Playwright-Testabhängigkeit installiert werden;
PLAYWRIGHT_MODULE ist weiterhin eine Alternative für eine vorhandene Installation.

## 25.10.2026 — Bezirksplan und freiwillige Ziele (0.3.0)

Ein ein-/ausklappbarer Bezirksplan zeigt Gebäude, vier NPCs und die tatsächliche
Spielerposition. Ronny, Petra, Mara oder Uwe als Ziel wählen; der Wegweiser nennt
Himmelsrichtung und Gesprächsreichweite. Keine Teleportation oder automatische
Wegsuche. Die Karte ist auf Desktop anfangs offen, auf kleinen Bildschirmen zu.

Freiwillige Ziele erklären drei Grenzen bei verschiedenen Personen sowie den
bestehenden Kiosk-/Misstrauensmechanismus und Maras Pause. Anzeige folgt der
Schicht, einschließlich bereits geschlossener Kioske und gesperrter Gespräche.
Saveformat V1 unverändert: alte lokale und exportierte Stände bleiben nutzbar.
Kartenwahl ist nur eine Ansichtseinstellung des offenen Tabs und kein Savefeld.

Tests: npm test; node test/browser-navigation.mjs; die bestehenden
browser-smoke.mjs, browser-save.mjs und browser-touch.mjs. Installiertes Chrome
und Playwright nötig, nicht jedoch für den normalen Spielstart.

## 26.10.2026 — bewusste Schichtpause (0.4.0)

P und der sichtbare Pauseknopf öffnen ein zugängliches Pausemenü. Spielzeit,
Bewegungen und Cooldown stehen still; gehaltene Tastatur-/Touchrichtungen werden
verworfen. Fortsetzen beginnt mit neuem Zeitanker, ohne Hintergrundzeit nachzuholen.
Der Sichtbarkeitswechsel zu hidden pausiert ebenfalls; Rückkehr bleibt pausiert.
Dialoge und Schichtberichte bleiben erhalten. Speichern, Laden und Export sind im
Pausemenü möglich; Laden hebt eine Pause nicht auf. Escape oder P und der
Fortsetzenknopf setzen bewusst fort. Saveformat V1 bleibt unverändert, Pause ist
kein persistentes Spielfeld. Tastatur-Space aktiviert normale Buttons wieder.

11 Node-Modelltests und fünf Chromeproben bestanden: neue Pauseprobe plus alle
bisherigen Spiel-/Save-/Touch-/Kartenproben. Die Pauseprobe verwendet echte Tasten,
Zeitvergleiche, gespeicherte Schichten und emuliertes Touch. visibilitychange wurde
in dieser Automationsumgebung als ausdrücklich synthetische Listener-Integration
getestet: Chrome meldete beim nativen Tabwechsel weiterhin visible. Kein bestätigter
OS-Tab-/Minimiernachweis. Näheres: VERIFICATION-20261026.md.
