# Weerwolven Rollenboek

Website met rollen uit Digitaal Weerwolven (React, Vite en TypeScript).

## Starten

```
npm install
npm run dev
```

## Bouwen

```
npm run build
```

De rolgegevens staan in `src/data/roles.json`; de typen in `src/types.ts`.

## Mijn lijst, kopiëren en Excel

Met het vinkje op elke kaart of regel (of de knop in het detailvenster) voeg je rollen en personages toe aan het tabblad 'Mijn lijst'. De lijst wordt niet bewaard: hij is weg als je de pagina ververst.

- `Kopieer als tekst` zet alle gekozen items achter elkaar op het klembord, in de vorm `*Naam:* …`, `*Rol:* …`, `*Alliantie:* …`, `*Omschrijving:* …`, `*Rolkrachten:* …`, `*Winconditie:* …`. Lege velden worden weggelaten.
- `Download Excel` maakt een bestand met per item een cel met diezelfde tekst, plus losse kolommen (soort, naam, rol, thema, alliantie, omschrijving, rolkrachten, winconditie). De Excel-bibliotheek (`write-excel-file`) wordt pas geladen als je op de knop klikt. Na het ophalen van deze versie moet je één keer `npm install` draaien.
- `Trek een willekeurige rol` (bovenaan) kiest willekeurig uit alle rollen en personages samen en toont eerst alleen de naam.

## Gegevens

Alle rollen staan in `src/data/roles.json`, met twee lijsten:

- `rollen`: algemene rollen (bijvoorbeeld Jager, Heks, Beschermengel).
- `personages`: personages en eigen uitwerkingen (bijvoorbeeld Xander, Spock, of een uitwerking zonder personagenaam).

### Rol en personage koppelen

De koppeling staat op één plek: het veld `rolIds` (een lijst) bij het personage. Een personage kan dus bij meerdere rollen horen, en een rol kan meerdere personages hebben.

- `"rolIds": ["rol-beschermengel"]` maakt het personage een variant van die algemene rol.
- `"rolIds": ["rol-kapitein", "rol-weerwolf"]` maakt het personage een variant van beide rollen; het personage staat dan bij allebei onder de varianten.
- `"rolIds": []` maakt het personage zelfstandig.

De varianten van een rol worden door de site zelf uit `rolIds` afgeleid; je hoeft ze dus niet bij de rol bij te houden. In de ontwikkelmodus (`npm run dev`) verschijnt een waarschuwing in de console als een id in `rolIds` naar een rol verwijst die niet bestaat.

De rolnaam van een personage (`rol`) is alleen een tekst die getoond wordt. Hij hoeft niet gelijk te zijn aan de naam van de algemene rol: Pam heeft bijvoorbeeld rol 'De dronkaard' en is toch een variant van Valse Engel.

### Alliantie

`Goed`, `Neutraal`, `Slecht` of `Gelinkt` (de alliantie van een andere speler). Bij algemene rollen komt de alliantie uit de celkleur in het oorspronkelijke Excel-bestand.
