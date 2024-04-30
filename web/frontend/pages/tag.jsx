import React, { useState, useRef, useEffect } from 'react';
import { Card, TextContainer, Text } from "@shopify/polaris";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import inika_logo from "./Inika_logo.png";
import "./tagging.css"
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


export const tag = () => {
const emptyToastProps = { content: null };
const [isLoading, setIsLoading] = useState(true);
const [toastProps, setToastProps] = useState(emptyToastProps);
  const [imageFile, setImageFile] = useState(null);
  const [textList, setTextList] = useState([]);
  const [newText, setNewText] = useState('');
  const imageInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [jsonResult, setJsonResult] = useState(null);
  const [tags, setTags] = useState([]);
  const fetch = useAuthenticatedFetch();
  const tagInputRef = useRef(null);
  const [taggedImages, setTaggedImages] = useState([])
  const [editableTag, setEditableTag] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);
  const [resultTags, setResultTags] = useState(parsedResult);
  const [parsedResults, setParsedResults] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editableIndex, setEditableIndex] = useState(null);
  const [editedTag, setEditedTag] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);




  const toastMarkup = toastProps.content && !isRefetchingCount && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

    const fetchData = async () => {
        try {
            const response = await fetch("/api/products/all")
            console.log(await response.json())
        }
        catch (err) {
            console.log(err)
        }
    }

    
  
  
  const handleImageChange = (event) => {
    setImageFile(event.target.files[0]);
  };
  
  const convertBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        const base64Data = fileReader.result.match(/base64,(.*)$/)[1]; // Extract base64 part
        resolve(base64Data);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  useEffect(() => {
    // Parse the query parameter to get the selectedImages and selectedIds
    const queryParams = new URLSearchParams(location.search);
    const selectedParams = queryParams.get("selectedParams");
    if (selectedParams) {
      const { selectedImages, selectedIds } = JSON.parse(decodeURIComponent(selectedParams));
      setSelectedImages(selectedImages);
      setSelectedIds(selectedIds);
      console.log("Selected images:", selectedImages);
      console.log("Selected IDs:", selectedIds);
    } else {
      setSelectedImages([]);
      setSelectedIds([]);
      console.log("Not from Tag");
    }
  }, [location.search]);

  
  const handleTextChange = (event) => {
    setNewText(event.target.value.toLowerCase());
  };
  const handleToggleEdit = (key) => {
    setEditableTag(key);
  };

  const clearAllTag = () =>{
    setTags([])
  }

  const handleTagChange = (e, key) => {
    if (e.key === "Enter") {
      setEditableTag(null); // Make it non-editable when Enter is pressed
      setResultTags({ ...resultTags, [key]: e.target.value });
    }
  };

  const handleTagInputKeyPress = (event) => {
    if (event.key === "Enter" && event.target.value.trim() !== "") {
      const newTags = event.target.value
        .split(",") // Split input by comma
        .map((tag) => tag.trim()) // Trim each tag
        .filter((tag) => tag !== ""); // Remove empty tags

      setTags((prevTags) => [...prevTags, ...newTags]);
      event.target.value = ""; // Clear the input field
    }
  };

  function convertImageToBase64(imgUrl, callback) {
    const image = new Image();
    image.crossOrigin='anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = image.naturalHeight;
      canvas.width = image.naturalWidth;
      ctx.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL();
      callback && callback(dataUrl)
    }
    image.src = imgUrl;
  }

  const getBase64ImageFromUrl = async (imageUrl) => {
    var res = await fetch(imageUrl);
    var blob = await res.blob();
  
    return new Promise((resolve, reject) => {
      var reader  = new FileReader();
      reader.addEventListener("load", function () {
          resolve(reader.result);
      }, false);
  
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }

  
  
  const handleAddText = () => {
    if (newText.trim() !== '') {
      setTextList([...textList, newText.trim()]);
      setNewText('');
    }
  };
  
  
  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      // setUploadedImage(selectedImages[i]);
      // const image = downloadImage(selectedImages[i]);
      // const image =  await getImageBlobFromUrl(selectedImages[i]);

      // use server to solve cors error and directly take base64 as response
      // cors error is only because of browser you cant do anything in client side
      // const base64Data = await fetchBase64Image(selectedImages[i]);
      
      formData.append("tags", textList.join(","));
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      // console.log(textList);
      // console.log(base64Data);
      setTextList([]);
      const processedImages = [];

      try {
        // Define an array to hold the promises
        const promises = [];
    
        // Loop through each URL in selectedImages
        selectedImages.forEach((url) => {
          // Call the async function for the current URL and store the promise
          const promise = getBase64ImageFromUrl(url);
          promises.push(promise); // Push the promise into the promises array
        });
    
        // Wait for all promises to resolve
        const results = await Promise.all(promises);
        results.forEach((url) => {
            processedImages.push(url.slice(23))
        })
    
        // Log the processed images

      } 
      catch (error) {
        console.error('Error processing images:', error);
      }

      console.log(processedImages)

      console.log("startTs", Date());
     
      const response = await axios.post(
        // "https://us-central1-inika-webpage.cloudfunctions.net/auto-tag ",
        // "https://us-central1-inika-webpage.cloudfunctions.net/tagUrls",
        "https://us-central1-inika-webpage.cloudfunctions.net/ShopifyTag",
        {
          image_urls: processedImages,
          tag_list: tags,
          url: selectedImages,
        }
      );

      // console.log(response.data);
      // setJsonResult(response.data);
      // Extracting the JSON string from the result
      const result_data = response.data.result;
      console.log(result_data)
      setParsedResults([])


      const tagsReqBody = []
      const finalTags = []

      for (let i = 0; i < result_data.length; i++) {
        try {
          const jsonString = result_data[i].match(/\{([^)]+)\}/)[0];

          // Parsing the JSON string
          const parsedResult = JSON.parse(jsonString);

          console.log(parsedResult)
          finalTags.push(parsedResult)
        } catch (error) {
          console.error("Error submitting data:", error);
        }
    }
    console.log(finalTags)
    const urlToTagMap = new Map(finalTags.map(tag => [tag.url, tag]));
    const arrangedTags = selectedImages.map(url => {
        const tag = urlToTagMap.get(url);
        if (tag) {
            delete tag.url; // Remove the 'url' property from the JSON object
        }
        return tag;
    }).filter(tag => tag !== undefined);
    console.log(arrangedTags)
    setParsedResults(arrangedTags)
    setParsedResult(arrangedTags)

      console.log("endTs", Date());
      const tagOutputCards = document.getElementsByClassName("tag-output-card");

      for (let i = 0; i < tagOutputCards.length; i++) {
        tagOutputCards[i].style.display = "flex";
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const renderUploadedImage = () => {
    if (uploadedImage) {
      return (
        <div className="uploaded-image-container">
          <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" style={{height: "270px", width: "200px"}} />
        </div>
      );
    }
    return null;
  };

  const renderUploadedImageByIndex = (imageUrl) => {
    if (imageUrl) {
      return (
        <div className="uploaded-image-container">
          <img
            src={imageUrl}
            alt="Uploaded"
            // style={{ height: "270px", width: "200px" }}
          />
        </div>
      );
    }
    return null;
  };


  const renderJsonData = (data, indent = 0) => {
  
    return (
      <div>
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            {key}: {value}
          </div>
        ))}
      </div>
    );
  };

  const handleUpdateItems = async () =>  {
    try {
        await Promise.all(
          selectedIds.map(async (id) => {
            const tags = (Object.values(parsedResults[selectedIds.indexOf(id)]))
            const response = await fetch(`/api/product/update`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ id: id, tags: tags }) // Pass the id in the request body
            });
            if (!response.ok) {
              throw new Error(`Failed to update product with ID ${id}`);
            }
          })
        );
        console.log("All products updated successfully");
      } catch (error) {
        console.error("Error updating products:", error);
      }
  };


  return (
<div className='inikaTagBG'>
{parsedResult && (
<div>
    <button onClick={handleUpdateItems}>
        Update Items in Catalog
    </button>
</div>
)}
    <div >
<img src={inika_logo} alt="Centered Image" className="TagImage" />
</div>

{selectedImages.length === 0 ? (
    <div className="ErrorMessage">
      <h1>Please go to the catalog page and choose which images you wish to tag.</h1>
    </div>
  ) : (
<div className='main'>
    <div class="tag-input-section ">
          <h3 class="title">Browse Image Files</h3>

          <div className="base-card tag-input-text">
            <span className="subtitle">Tags</span>
            <p className="body">Click enter or add comma to add tags</p>
            <input
              className="tag-input-text-field"
              type="text"
              ref={tagInputRef}
              onKeyPress={handleTagInputKeyPress}
            />
            <div className="tag-list">
              {tags.map((tag, index) => (
                <span key={index} className="tag-item">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div class="btn-section">
            <button class="btn">Clear all</button>
            <button
              class="btn"
              onClick={handleSubmit}
              // disabled={!selectedImages || tags.length === 0}
            >
              Generate tags
            </button>
          </div>
        </div>

        <div className="result-container">
        {selectedImages &&
            Object.entries(selectedImages).map(([data, index]) => (
              <div key={index} class="tag-output-card" id="tag-output-card">
                <div class="image-output-card">
                  <div style={{ float: "left", margin: "0 auto" }}>
                    {renderUploadedImageByIndex(
                     index
                    )
                   }
                   {/* { console.log(data[1]["url"])} */}
                  </div>
                </div>
                <div class="output-tag-list">
                  <div class="subtitle">
                    <span class="subheading">Result</span>
                  </div>

                  {parsedResults[data] && (
            <div className="output-tag-list">
                {Object.entries(parsedResults[data]).map(([key, value]) => (
                    <div className="output-tag-list-item" key={key}>
                            {editableTag !== key ? (
                              <span onClick={() => handleToggleEdit(key)}>
                                {key}: {value}
                              </span>
                            ) : (
                              <input
                                type="text"
                                defaultValue={value}
                                onKeyPress={(e) => handleTagChange(e, key)}
                                onBlur={() => setEditableTag(null)} // Make it non-editable when blurred
                                autoFocus // Focus on the input when it becomes editable
                              />
                            )}
                    </div>
                ))}
            </div>
        )}

                  {!parsedResult && 
                  (<div>
                    <h1>Input some tags and click on generate to get result.</h1>
                  </div>)}
                </div>



                </div>
                ))}
        </div>

        </div>
        )}


    </div>
);
  };

  export default tag;

  