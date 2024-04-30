import { Card, Page, Layout, TextContainer, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import React, { useEffect, useState } from 'react';
import "./InikaTag.css"
import { Link, useNavigate } from 'react-router-dom';





export const InikaTag = () => {


    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const navigate = useNavigate();
  
    // State to manage selected images
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const fetch = useAuthenticatedFetch();
    const [productImages, setProductImages] = useState([]);
    const [productIDList, setProductIDs] = useState([]);

    const toggleCheckboxes = () => {
        setShowCheckboxes(!showCheckboxes);
      };
    
      // Function to toggle individual image selection
      const toggleImageSelection = (imageUrl, id) => {
        if (selectedImages.includes(imageUrl)) {
          setSelectedImages(selectedImages.filter((img) => img !== imageUrl));
          setSelectedIds(selectedIds.filter((_id, index) => index !== productImages.indexOf(imageUrl)));
        } else {
          setSelectedImages([...selectedImages, imageUrl]);
          setSelectedIds([...selectedIds, id]);
        }
      };

        const performAction = () => {
    // Your logic to perform action here
    console.log("Selected images:", selectedImages);
    console.log(selectedIds)

    const queryParams = {
        selectedImages: selectedImages,
        selectedIds: selectedIds
      };
      
      // Convert the object to a JSON string
      const queryString = JSON.stringify(queryParams);
      
      // Encode the JSON string
      const encodedQueryString = encodeURIComponent(queryString);
      navigate(`/tag?selectedParams=${encodeURIComponent(JSON.stringify(queryParams))}`);
  };

    useEffect(() => {


        const fetchData = async () => {
            try {
                const response = await fetch("/api/products/all");
                const productInfo = ( await response.json());
                console.log(productInfo)
                const productImages = productInfo.data.map(item => {
                    if (item.image) {
                        return item.image.src;
                    } else {
                        return null;
                    }
                });
                const productIds = productInfo.data.map(item => {
                    if (item.image) {
                        return item.id;
                    } else {
                        return null;
                    }
                });
                setProductImages(productImages);
                setProductIDs(productIds)
                console.log(productIds)
                console.log(productImages)

            } catch (err) {
                console.log(err);
            }
        };

        fetchData(); // Call fetchData when the component mounts

        // Optionally, return a cleanup function if needed
        // return () => {
        //     cleanup logic here
        // };
    }, []); // Pass an empty dependency array to run the effect only once on component mount

    return (

        <div className="inikaTagBG">

<div className="buttonContainer-view">
        <button
          onClick={() => setShowCheckboxes(!showCheckboxes)}
          style={{ backgroundColor: "#C1AA96", opacity: "0.8", color: "#000" }}
        >
          {showCheckboxes ? "De-Select" : "Select"}
        </button>


        {showCheckboxes && selectedImages.length > 0 && (
          <button onClick={performAction} style={{ backgroundColor: "#C1AA96", opacity: "0.8", color: "#000" }}>Tag Selected Images</button>
        )}
</div>
            
<div className="image-container">
        {productImages.map((imageUrl, index) => (
          <div key={index} className="image-wrapper">
            {showCheckboxes && (
              <input
                type="checkbox"
                checked={selectedImages.includes(imageUrl)}
                onChange={() => toggleImageSelection(imageUrl, productIDList[index])}
                style={{ width: "15px", height: "15px", marginRight: "5px"}} 
              />
            )}
            <img
              className="image"
              src={imageUrl}
              alt={`No Image available`}
            />
          </div>
        ))}
      </div>
        </div>
    );
   
}