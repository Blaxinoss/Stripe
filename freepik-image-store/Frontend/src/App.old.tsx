
import axios from "axios";
import { useState } from "react";
import './App.css';
import Form from "./Components/Form";


interface ImageData {
  id: number;
  isFree: boolean;
  original: string;
  thumbnail: string;
  title: string;
}

function App() {
  const [link, setLink] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [FormOpen, setFormOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);



  const searchImages = async () => {
    const response = await axios.get("http://localhost:5000/search", { params: { searchLink: link } });
    setImages(response.data);
  };

  return (
    <div>
      <input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
      <button onClick={searchImages}>Search</button>
      <div>
        {images.map((img: ImageData) => {
          return (

            <div key={img.id}>
              <p>{img.title}</p>
              <p>{img.isFree ? "Free" : "Paid"}</p>
              <button style={{ display: "block", width: "100%" }} onClick={() => {
                setFormOpen(true);
                setSelectedImage(img.original);
              }}>Buy</button>
              <img src={img.thumbnail} alt="preview" />


            </div>
          )
        })}
      </div>

      {FormOpen && selectedImage && <Form selectedImage={selectedImage} />}


    </div>
  );
}


export default App;

