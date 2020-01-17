import React, { useState, useEffect, useRef } from 'react';
import { motion, useTransform, useMotionValue, useAnimation } from 'framer-motion';
import styled from 'styled-components';
import './App.css';
import trashcan from './images/trashcan.png';
import { link } from 'fs';
import backarrow from './images/backarrow.png';
const Component = styled(motion.div)`
   position: absolute;
   display: flex;
   flex-direction: column;
   z-index: 0;
   left: 46%;
   top: 40%;
`;

const Box = styled(motion.div)`
   width: 10rem;
   height: 10rem;
   background-color: rgb(90%, 90%, 90%);
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
`;
const Header = styled.div`
   font-size: 1rem;
   font-weight: bold;
   margin-bottom: .2rem;
`
const Subtitle = styled.div`
   font-size: .75rem;
   text-align: center;
`
const LinkInput = styled.input`
   background-color: rgb(80%, 80%, 80%);
   width: 85%;
   height: 1.5rem;
   border: none;
   border-radius: 2rem;
   padding-left: .5rem;
   margin-bottom: .5rem;
   margin-top: .5rem;
`;
const Button = styled(motion.button)`
   font-size: .75rem;
   font-weight: bold;
   width: 60%;
   height: 1.5rem;
   background-color: rgb(80%, 80%, 80%);
   border: none;
   border-radius: 1rem;
`
const Backarrow = styled(motion.img)`
   width:37px;
   height:34px;
   margin-right: .5rem;
`
const FileLabel = styled(motion.label)`
   font-size: 1rem;
   font-weight: bold;
   width: 70%;
   height: 2.5rem;
   background-color: rgb(80%, 80%, 80%);
   border: none;
   border-radius: 1rem;
   
   display: flex;
   align-items: center;
   justify-content: center;
`;
const FileInput = styled.input`
   visibility: hidden;
   display: none;
`;
const Logo = styled(motion.img)`
   width: 6.5rem;
   height: 6.5rem;
   object-fit: cover;
   object-position: center;
   border-radius: 100%;
`

function Link(props) {
   const component = useRef(null);
   const linkInput = useRef(null);
   const [stage, setStage] = useState(0);
   const [image, setImage] = useState("");
   const [linkAddress, setLinkAddress] = useState("");
   const [loading, setLoading] = useState(false);
   const [imageError, setImageError] = useState("");
   const [hover, setHover] = useState(false);
   const [deleted, setDeleted] = useState(false);
   // Animation Vars
   const controls = useAnimation();
   let x = useMotionValue(getScalePos());
   const motionRange = [-33, 0, 33];
   const scaleRange = [.5, 1, 1.5];
   let scale = useTransform(x, motionRange, scaleRange);

   useEffect(() => {
      const currentStage = localStorage.getItem("stage" + props.identifier);
      const currentLink = localStorage.getItem("link" + props.identifier);
      if (currentStage != null) {
         setStage(parseInt(currentStage));
         if (parseInt(currentStage) === 2) {
            const currentImage = localStorage.getItem("image" + props.identifier);
            setImage(currentImage);
         }
      }
      if (currentLink !== null) {
         setLinkAddress(currentLink);
      }
      controls.start({x: getTranslations()[0], y: getTranslations()[1], opacity: 1, transition: {duration: 1.5}})
   }, [])

   //Movement Functions
   function storeTranslations() {
      let elem = getComputedStyle(component.current);
      let matrix = new DOMMatrix(elem.transform);
      localStorage.setItem("translateXLink" + props.identifier, matrix.m41);
      localStorage.setItem("translateYLink" + props.identifier, matrix.m42);
   }
   function getTranslations() {
      if (localStorage.getItem("translateXLink" + props.identifier) !== null) {
         return [parseFloat(localStorage.getItem("translateXLink" + props.identifier)), parseFloat(localStorage.getItem("translateYLink" + props.identifier))]
      }
      else {
         return [0, 0];
      }
   }

   // Storage Functions
   function slidingDone(event, info){
      localStorage.setItem("scalePosLink" + props.identifier, info.point.x);
   }

   function getScalePos(){
      if(localStorage.getItem("scalePosLink" + props.identifier) !== null){
         console.log(parseInt(localStorage.getItem("scalePosLink" + props.identifier)));
         return parseInt(localStorage.getItem("scalePosLink" + props.identifier));
      }
      else{
         return 0;
      }
   }

   // Destroy Elements Functions
   function getElementIndex(identifier) {
      for (let i = 0; i < props.elements.length; i++) {
         //console.log(props.elements[i]);
         if (identifier === props.elements[i].id) {
            return i;
         }
      }
      return -1;
   }
   function handleTrashing() {
      if (props.canEdit) {
         setDeleted(true);
         let modifiedArray = props.elements.slice(0, getElementIndex(props.identifier)).concat(props.elements.slice(getElementIndex(props.identifier) + 1, props.elements.length));
         props.onChange(modifiedArray);
      }
      else {
         return;
      }
   }

   // Image and Storage Functions
   function imageHandler(e) {
      const files = e.target.files;
      if (files[0].size > 524288) { // 500 kilobytes
         setImageError("File has to be under 500 kilobytes");
      }
      else {
         setImageError("Submitted Successfully");
         uploadImage(files);
      }
   }
   async function uploadImage(files) {
      const data = new FormData();
      data.append('file', files[0]);
      data.append('upload_preset', 'etesam');
      setLoading(true);
      const res = await fetch('https://api.cloudinary.com/v1_1/dz5ashos1/image/upload',
         {
            method: 'POST',
            body: data
         })
      const file = await res.json();
      setLoading(false);
      setImage(file.secure_url);
      localStorage.setItem("image" + props.identifier, file.secure_url);
   }
   function storeImage() {
      setStage(2);
      localStorage.setItem("stage" + props.identifier, "2");
   }
   function storeLink() {
      setStage(1);
      localStorage.setItem("stage" + props.identifier, "1");
      if (linkInput.current.value[0] === "w" && linkInput.current.value[1] === "w" && linkInput.current.value[2] === "w") { // Is it a www link
         localStorage.setItem("link" + props.identifier, "https://" + linkInput.current.value);
         setLinkAddress("https://" + linkInput.current.value);
      }
      else {
         localStorage.setItem("link" + props.identifier, linkInput.current.value);
         setLinkAddress(linkInput.current.value);
      }
   }
   function goBack(value){
      setStage(value);
      localStorage.setItem("stage" + props.identifier, value);
   }
   // Display Function
   function displayContent() {
      if (stage === 0) { // Border radius, 0, 20, 100
         return (
            <Box animate={{ borderRadius: "0%" }} transition={{ duration: 1 }} >
               <Header>Paste Link Below</Header>
               <Subtitle> ex: www.reddit.com </Subtitle>
               <LinkInput ref={linkInput}></LinkInput>
               <Button onClick={() => { storeLink() }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>Next</Button>
            </Box>
         );
      }
      else if (stage === 1) {
         return (
            <Box animate={{ borderRadius: "20%" }} transition={{ duration: 1 }}>
               <FileLabel whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} htmlFor="files">Select Image</FileLabel>
               <FileInput id="files" type="file" onChange={(e) => { imageHandler(e) }}></FileInput>
               <Subtitle style={{ marginBottom: ".5rem", marginTop: ".5rem" }}>{imageError}</Subtitle>
               <Button onClick={() => { storeImage() }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>Submit</Button>
            </Box>
         );
      }
      else if (stage === 2) {
         return (
            <Box animate={{ borderRadius: "100%" }} transition={{ duration: 3 }}>
               {loading ? <h3> loading </h3> : <a style={{ borderRadius: "100%" }} href={linkAddress}><Logo src={image} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}></Logo></a>}
            </Box>
         );
      }
      else {
         return (<p>error</p>);
      }
   }
   function displayArrow(){
      if(stage === 0){
         console.log("none");
         return "none";
      }
      else{
         return "unset";
      }
   }
   if (deleted) {
      return (<div></div>);
   }
   else {
      return (
         <Component ref={component} initial={{opacity: 0}} animate={controls} style={{ scale }} drag dragMomentum={false} dragConstraints={{ left: -700, right: 775, top: -425, bottom: 375 }} onHoverStart={() => { setHover(true) }} onHoverEnd={() => {setHover(false)}} onDragEnd={()=>{storeTranslations()}}>
            <motion.div className="tools" initial={{ opacity: 0 }} animate={hover && props.canEdit ? { opacity: 1 } : { opacity: 0 }}>
               <Backarrow style={{display: displayArrow()}} src={backarrow} onClick={()=> {goBack(stage-1)}} whileHover={{scale: 1.1}} whileTap={{scale: .9}}></Backarrow>
               <div className="small-slider-container">
                  <div className="small-slider">
                     <motion.div className="small-handle" style={{ x }} drag={props.canEdit ? 'x'  : false} dragConstraints={{ left: -33, right: 33 }} dragElastic={0} dragMomentum={false} onDragEnd={(event, info) => { slidingDone(event, info) }}></motion.div>
                  </div>
               </div>
               <motion.img src={trashcan} className="small-delete-button" onClick={() => { handleTrashing() }} whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}></motion.img>
            </motion.div>
            {displayContent()}
         </Component>
      );
   }
}

export default Link;