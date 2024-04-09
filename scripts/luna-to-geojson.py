#!/usr/bin/env python3

""" Convert JSON files downloaded from Luna to a GeoJSON format that apes the MRM output.

    ---

    Notes: 
    * Luna JSON files may (and typically do?) contain multiple "annotation" items -- this
      function just takes the first one (in what I've looked at so far, this first one is
      the MRM output and the second one is a manual correction).

    * Coordinates are extracted from the SVG selector.  If the selector is not of type
      "SvgSelector", it is skipped.  (I've only seen one such example so far, where one
      feature was type = "FragmentSelector" -- may be worth looking into at some point.)
    
    * the `convert` command's `--scale-resolution` option takes a value of the form
      `<orig_width>x<orig_height>-<target_width>x<target_height>`, where the `orig` values
      are the dimensions of the original image to which the coordinates in the JSON file
      correlate, and the `target` values are the dimensions of the actual version of the
      image that will be used.

    ---
"""

__version__ = "0.1"

import json
import logging
import math
import re
from pathlib import Path
from typing import List

import typer
from rich.console import Console
from rich.logging import RichHandler
from typing_extensions import Annotated

cli = typer.Typer(
    add_completion=False,
    no_args_is_help=True,
    help=format(__doc__),
    rich_markup_mode="rich",
)


def extract_coordinates(item, scale_factor=None):
    """Extract coordinates from the item."""
    svg_string = item["target"]["selector"]["value"]
    assert 'transform="scale(1.0 1.0)"' in svg_string
    polygon = re.search(r"""<polygon points=\"(.*?)\"""", svg_string)
    if polygon is None:
        raise ValueError(svg_string)
    points = [_.split(",") for _ in polygon.group(1).split(" ")]

    if scale_factor is not None:
        return [[float(x) * scale_factor, -float(y) * scale_factor] for x, y in points]

    return [[float(x), -float(y)] for x, y in points]


def parse_features_from_luna_json(input_file, scale_factor=None):
    """Parse Luna JSON files."""

    features = []

    luna_json = json.load(input_file.open("r", encoding="utf-8"))
    for item in luna_json["items"]:
        if item["target"]["selector"]["type"] != "SvgSelector":
            logging.warning(
                f"Skipping item with type {item['target']['selector']['type']}",
            )
            continue

        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [extract_coordinates(item, scale_factor)],
                },
                "properties": {
                    "text": item["body"][0]["value"],
                    "score": 1,
                },
            }
        )

    return features


@cli.callback()
def common_options(
    verbose: bool = typer.Option(False, "--verbose", "-v"),
    quiet: bool = typer.Option(False, "--quiet", "-q"),
    version: bool = typer.Option(False, "--version"),
):
    """Common options:"""

    if version:
        print(__version__)
        raise SystemExit

    log_level = logging.DEBUG if verbose else logging.INFO
    log_level = logging.CRITICAL if quiet else log_level
    logging.basicConfig(
        level=log_level,
        format="%(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[RichHandler(markup=False, console=Console(width=180, stderr=True))],
    )


@cli.command()
def convert(
    input_files: Annotated[
        List[Path],
        typer.Argument(help="Input file (accepts multiple files, globs, etc.)"),
    ],
    output_file: str = typer.Option(None, "--output", "-o", help="Output file"),
    scale_resolution: str = typer.Option(None, "--scale-resolution"),
):

    scale_factor = None
    if scale_resolution is not None:
        [orig_res, target_res] = scale_resolution.split("-")
        [orig_h, orig_w] = orig_res.split("x")
        [target_h, target_w] = target_res.split("x")
        assert math.isclose(
            float(orig_h) / float(orig_w),
            float(target_h) / float(target_w),
            rel_tol=1e-5,
        ), "Invalid scale resolution"
        scale_factor = float(target_w) / float(orig_w)

    features = [
        feature
        for path_expr in input_files
        for luna_json_file in Path(path_expr.root).glob(str(path_expr))
        for feature in parse_features_from_luna_json(luna_json_file, scale_factor)
    ]

    mrm_style_geojson = {"type": "FeatureCollection", "features": features}

    if output_file:
        with open(output_file, "w", encoding="utf-8") as _fh:
            json.dump(mrm_style_geojson, _fh, indent=2)
    else:
        print(json.dumps(mrm_style_geojson, indent=2))


if __name__ == "__main__":
    cli()
