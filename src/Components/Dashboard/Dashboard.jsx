import React from "react";
import { useState } from "react";
import { query_textToImage_api } from '../../api/handle_api';
import './Dashboard.css';
import * as markerjs2 from 'markerjs2';
import Loader from "../Loader.jsx";
import html2canvas from "html2canvas";

const Dashboard = () => {
    const [inputText, setInputText] = useState('');
    const [imageArray, setImageArray] = useState(Array.from({ length: 10 }));
    const [selectedPanel, setSelectedPanel] = useState(-1);
    const [generatedImage, setGeneratedImage] = useState("");
    const [isLoading, setLoading] = useState(false);
    const imgRefArray = Array(10).fill().map((_, i) => React.createRef());
    const showMarkerArea = (index) => {
        const imgRef = imgRefArray[index];
        if (imgRef.current !== null) {
          // create a marker.js MarkerArea
          const markerArea = new markerjs2.MarkerArea(imgRef.current);
          // attach an event handler to assign annotated image back to our image element
            markerArea.settings.displayMode = 'popup';
            markerArea.renderAtNaturalSize = true;
            markerArea.settings.defaultColor = 'black';
            markerArea.settings.defaultFillColor = 'black';          
          markerArea.addEventListener("render", (event) => {
            if (imgRef.current) {
              imgRef.current.src = event.dataUrl;
            }
          });
          // launch marker.js
          markerArea.show();
        }
      }

    const handleApiQuery = async () => {
        try {
            setLoading(true)
            if (inputText === "") {
                alert("Empty input text!");
                return;
            }
            const response = await query_textToImage_api({ "inputs": inputText });
            const imageUrl = URL.createObjectURL(response);
            setGeneratedImage(imageUrl);
        }
        catch (error) {
            console.log("Error: ", error);
        }
        finally {
            setLoading(false);
        }
    }

    const handlePanelClick = (index) => {
        // console.log(index);
        setSelectedPanel(index);
    }

    const handleInputChange = (props) => {
        setInputText(props.target.value);
    }

    const handleConfirmChanges = () => {
        if(selectedPanel > 9 || selectedPanel < 0){
            alert("Select Panel to add image");
            return;
        }
        setImageArray((prevImages) => {
            const newImages = [...prevImages];
            newImages[selectedPanel] = generatedImage;
            return newImages;
        });
    }

    const deleteImage = (index) => {
        setImageArray((prevImages) => {
            const newImages = [...prevImages];
            newImages[index] = undefined;
            return newImages;
        });
    }
    const printDocument = () => {
        const input = document.getElementById('divToPrint');
        html2canvas(input)
          .then((canvas) => {
            const dataURL = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataURL;
            a.download = 'comic_panel.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          })
        ;
      }

      return (
        <>
            <div className="generate-wrapper">
                <section className="left-col">
                    <div className="prompt-wrapper">
                        <label for="userPrompt">Enter your prompt here:</label>
                        <div className="input-field">
                            <input disabled={isLoading===true} type="text" id="userPrompt" onChange={handleInputChange} placeholder="Eg: A cartoon of a monkey in space" required />
                        </div>
                        <button disabled={isLoading===true} type="submit" id="generateButton" onClick={() => handleApiQuery()}>Generate</button>
                    </div>
                    {
                        isLoading ? 
                        <>
                            <div className="edit-panel">
                                <Loader/>
                            </div>
                        </>:
                        generatedImage ?
                            <>
                                <div className="edit-panel">
                                    <span id="loader"></span>
                                    <img
                                        id='marker-img'
                                        src={generatedImage}
                                        alt="Generated pic"
                                        style={{ 'height': "100%", "width": "100%" }}
                                    />
                                </div>
                            </> :
                            <>
                                <div className="edit-panel">
                                    <span id="loader"></span>
                                </div>
                            </>
                    }
                    <div className="marker-button-wrapper">
                        <button disabled={isLoading===true} id="confirmButton" onClick={() => {handleConfirmChanges()}}> Add to Selected Panel </button>
                    </div>
                </section>
                <section className="right-col">
                    <div className="comic-panel" id="divToPrint">
                        <div className="grid" >
                            {
                                imageArray.map((imageSrc, index) => {
                                    var classnames = "panel";
                                    if (index === selectedPanel) classnames = classnames + " selected";

                                    return (
                                        <div className={classnames} key={index} onClick={() => { handlePanelClick(index) }}>
                                            { imageSrc && <>
                                            <div className="action-buttons">
                                                <button className="edit-small" onClick={() => {showMarkerArea(index)}}></button>
                                                <button className="delete-small" onClick={() => {deleteImage(index)}}></button>
                                            </div>
                                             <img
                                                ref = {imgRefArray[index]}
                                                id='marker-img'
                                                src={imageSrc}
                                                alt="Generated pic"
                                                style={{ 'height': "100%", "width": "100%" }}
                                                className='panel-image'
                                            />
                                            </>}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <button className="download-button-class" id="download-button" onClick={() => {printDocument()}}>Download</button>
                </section>
            </div>
        </>
    )
}

export default Dashboard;