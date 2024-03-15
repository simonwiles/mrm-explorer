# Sundry Scripts


## luna-to-geojson.py

```
❯ ./luna-to-geojson.py

 Usage: luna-to-geojson.py [OPTIONS] COMMAND [ARGS]...

 Convert JSON files downloaded from Luna to a GeoJSON format that apes the MRM output.
 ---

 Notes:
 * Luna JSON files may (and typically do?) contain multiple "annotation" items -- this
   function just takes the first one (in what I've looked at so far, this first one is
   the MRM output and the second one is a manual correction).

 * Coordinates are extracted from the SVG selector.  If the selector is not of type
   "SvgSelector", it is skipped.  (I've only seen one such example so far, where one
   feature was type = "FragmentSelector" -- may be worth looking into at some point.)

 ---

╭─ Options ─────────────────────────────────────────────────────────────────────────────╮
│ --verbose  -v                                                                         │
│ --quiet    -q                                                                         │
│ --version                                                                             │
│ --help               Show this message and exit.                                      │
╰───────────────────────────────────────────────────────────────────────────────────────╯
╭─ Commands ────────────────────────────────────────────────────────────────────────────╮
│ convert                                                                               │
╰───────────────────────────────────────────────────────────────────────────────────────╯

```

e.g. to combine multiple luna JSON response `luna.1.json, luna.2.json ...`:

```sh
❯ ./luna-to-geojson.py convert /path/to/luna.*.json > /path/to/output.geojson
```
