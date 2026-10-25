# Fortschritt

## 20.10.2026 — Projektidee aufgenommen

Übergebene Spielideen, beide Modusvarianten, Stil und offene technische
Entscheidungen im README gesichert. Noch keine Implementierung oder Tests.

## 21.10.2026 — Offene Sandbox spielbar

Gewählten Modus umgesetzt: lokal im Desktop-Browser ohne Abhängigkeiten oder
Hosting. Frei begehbarer Betonbezirk mit Gebäudekollision und prozeduraler
Pseudo-3D-Canvasgrafik. Vier ausdrücklich erwachsene, erfundene NPCs mit je drei
Dialogentscheidungen und Erinnerungen an Begegnungen/Schubsereien.

Energie, Geld, Chaos, Misstrauen und unterschiedliche gesetzte Grenzen wirken
sichtbar auf die Schicht. Kostenlose Pause/Deeskalation, fragwürdige Geldinvestition,
absurde Behörden-/Coachingdialoge, nichtgrafisches Schubsen mit Cooldown und
sozialen Folgen. Hoher Chaoswert schließt den Kiosk, Misstrauen löst einmalig
eine 12-Euro-Unruhepauschale aus. Wiederholtes Schubsen sperrt den Gesprächsweg.
Drei Grenzen bei unterschiedlichen NPCs erlauben Feierabend und Weiterspielen;
null Energie beendet die Schicht. Neustart verwirft alle Laufzeitdaten.

Produktionslogik mit Node getestet. Chrome-Playwright-Probe benutzt tatsächliche
WASD-/E-/F-/Dialogtasten: Bewegung, Gespräch, Geldausgabe, sichtbare Folgen,
Neustart, drei unterschiedliche NPC-Grenzen, Ende und Weiterspielen bestanden.
Keine JavaScript-Laufzeitfehler, 390px-Layout ohne horizontalen Überlauf.
Desktop- und Dialogscreenshots visuell geprüft. Belege im aktuellen Chat unter
outputs/spiel. Kein Touch-Spieltest, kein physisches Handy, kein öffentliches Hosting.

## 21.10.2026 — Öffentliche Quelle vorbereitet

Playwright-Testabhängigkeit fest versioniert und Lockfile ergänzt. Frische npm-ci-
Installation und echte Chrome-Spielprobe bestanden; alle sechs Modelltests bestehen.
User hat öffentliche GitHub-Veröffentlichung ausdrücklich erlaubt. Verlaufscan
auf erkennbare Zugangsdaten und private Datendateien ohne Fund.

## 23.10.2026 — Spielstand und Touchsteuerung

Versionierter lokaler Speicherplatz, Export und Import bis 32 KiB. Vollständige
Validierung vor Zustandsübernahme: bekannte NPCs, begehbare Positionen, gültige
Werte und konsistente Konsequenzen. Vertrauen, Schubsen, Cooldown, Dialog,
Endzustand und Grenzen überleben das Laden. Neustart löscht den Speicherplatz.
Manuelles Speichern ist erforderlich; Änderungen nach dem Speichern bleiben
bis zum nächsten Speichern ausschließlich in der laufenden Schicht.

Touchbuttons unterstützen gehaltene Bewegungen und Pointer-Abbruch. Reden und
Schubsen sind per Button zugänglich. Keine physischen Geräte verwendet.

## 25.10.2026 — Navigation und abgeleitete Aufgabenanzeige, Version 0.3.0

Codeeigene SVG-Karte mit Gebäuden, Spieler und NPCs, Zielwahl und dynamischer
Himmelsrichtung/Gesprächsreichweite. Ein-/ausklappbar, Touchziele mindestens 44px.
Freiwilliger Schichtplan zeigt Grenzen bei unterschiedlichen NPCs, Kioskstatus,
Unruhepauschale und kostenlose Pause. Bereits verweigerte Gespräche werden als
solche bezeichnet; gesunkener Chaoswert öffnet einen geschlossenen Kiosk nicht.
Kein Teleport, keine neue Spielregel, kein fremdes Asset, keine neue Gewaltmechanik.

11/11 Modelltests und vier echte Chromeproben bestanden. Neue Navigationsprobe
bewegt den Spieler tatsächlich, prüft Liveposition gegen exportierbaren Zustand,
Zielwechsel ohne Bewegung, erreichte Gesprächsreichweite, neue Grenze, Reload,
Tastaturtoggle und Touchkarte bei 390px. Bestehende Smoke-/Save-/Touchregressionen
bestanden. Desktop-/Mobilaufnahmen visuell geprüft; kein physisches Gerät.
Saveformat Version 1 bleibt unverändert und enthält keine Navigationseinstellungen.
