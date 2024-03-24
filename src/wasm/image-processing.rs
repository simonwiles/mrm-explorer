use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn crop(file: &[u8], x: u32, y: u32, w: u32, h: u32) -> Box<[u8]> {
    let reader = image::io::Reader::new(Cursor::new(file))
        .with_guessed_format()
        .expect("Cursor io never fails");
    let image = reader.decode().expect("Error decoding the image");
    let cropped_image = image.crop_imm(x, y, w, h);
    let mut cropped_buffer: Vec<u8> = Vec::new();
    cropped_image
        .write_to(&mut cropped_buffer, image::ImageOutputFormat::Png)
        .expect("Error encoding the cropped image to PNG");
    cropped_buffer.into_boxed_slice()
}
