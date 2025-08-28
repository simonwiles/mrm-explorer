# Sundry Scripts


## luna-to-geojson.py

```
❯ ./luna-to-geojson.py

 Usage: luna-to-geojson.py [OPTIONS] COMMAND [ARGS]...

 Convert JSON files downloaded from Luna to a GeoJSON format that is suitable for use
    with the Map ATR Explorer.
 ---

 Notes:
 * Luna JSON files may (and typically do?) contain multiple "annotation" items -- this
   function just takes the first one (in what I've looked at so far, this first one is
   the Text-Spotter output and the second one is a manual correction).

 * Coordinates are extracted from the SVG selector.  If the selector is not of type
   "SvgSelector", it is skipped.  (I've only seen one such example so far, where one
   feature was type = "FragmentSelector" -- may be worth looking into at some point.)

 * the `convert` command's `--scale-resolution` option takes a value of the form
   `<orig_width>x<orig_height>-<target_width>x<target_height>`, where the `orig` values
   are the dimensions of the original image to which the coordinates in the JSON file
   correlate, and the `target` values are the dimensions of the actual version of the
   image that will be used.

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
```
❯ ./luna-to-geojson.py convert --help

 Usage: luna-to-geojson.py convert [OPTIONS] INPUT_FILES...

╭─ Arguments ───────────────────────────────────────────────────────────────────────────╮
│ *  input_files      INPUT_FILES...  Input file (accepts multiple files, globs, etc.)  │
│                                     [default: None]                                   │
│                                     [required]                                        │
╰───────────────────────────────────────────────────────────────────────────────────────╯
╭─ Options ─────────────────────────────────────────────────────────────────────────────╮
│ --output            -o      TEXT  Output file [default: None]                         │
│ --scale-resolution          TEXT  [default: None]                                     │
│ --help                            Show this message and exit.                         │
╰───────────────────────────────────────────────────────────────────────────────────────╯

```


e.g. to combine multiple luna JSON response `luna.1.json, luna.2.json ...`:

```sh
❯ ./luna-to-geojson.py convert /path/to/luna.*.json > /path/to/output.geojson
```
