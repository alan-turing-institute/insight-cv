import { useState, useRef } from "react";
import { Button, Form } from "react-bootstrap";
import AvatarEditor from "react-avatar-editor";

export function PlaceholderImage({ size }) {
  return (
    <div
      style={{
        width: size,
        "aspectRatio": "1 / 1",
        "backgroundColor": "#eeeeee",
        display: "flex",
        "alignItems": "center",
        "justifyContent": "center",
        padding: "20px",
        "fontSize": "small",
      }}
      className="m-1"
    >
      Select a thumbnail image to upload
    </div>
  );
}
// Component: image uploader
//
// Shows a browse file selector, zoom slider (and button to clear)
//
// The 'onSave' prop gets passed the image data as a jpeg-encoded
// data URL when the 'save' button is clicked
export default function ImageUpload({ onSave }) {
  const editor = useRef(null);
  const thumbnailFileSelectorRef = useRef(null);
  const [haveImage, setHaveImage] = useState(false);
  const [image, setImage] = useState("");
  const [zoomSliderValue, setZoomSliderValue] = useState("50");

  function handleUpdateImage(e) {
    setImage(URL.createObjectURL(e.target.files[0]));
    setHaveImage(true);
  }

  return (
    <div
      style={{
        margin: "30px",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "space-between",
      }}
    >
      <div>
        {haveImage ? (
          <AvatarEditor
            ref={editor}
            image={image}
            width={256}
            height={256}
            border={20.0}
            scale={1.05 ** (zoomSliderValue - 50.0)}
          />
        ) : (
          <PlaceholderImage size="300px" />
        )}
      </div>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "justify-content": "space-around",
        }}
      >
        <Form.Control
          ref={thumbnailFileSelectorRef}
          type="file"
          accept="image/*"
          onChange={handleUpdateImage}
          className="my-3"
        />
        <div>
          {" "}
          Zoom:{" "}
          <Form.Control
            type="range"
            disabled={!haveImage}
            min="0"
            max="100"
            value={zoomSliderValue}
            onChange={(e) => setZoomSliderValue(e.target.value)}
          />
        </div>
        <hr style={{ width: "100%" }} />
        <div style={{ display: "flex", "flex-direction": "column" }}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              thumbnailFileSelectorRef.current.value = null;
              setImage(null);
              setHaveImage(false);
              setZoomSliderValue("50");
            }}
          >
            Clear selected image
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (editor && haveImage) {
                onSave(
                  editor.current
                    .getImageScaledToCanvas()
                    .toDataURL("image/jpeg"),
                );
              } else {
                onSave(null);
              }
            }}
          >
            Save image
          </Button>
        </div>
      </div>
    </div>
  );
}
