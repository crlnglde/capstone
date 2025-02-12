import React, { useEffect, useState } from "react";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

import axios from "axios";
import Modal from "./Modal"
import "../css/Residents.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Reports = () => {


  return (
    <div className="residents">
      
      <div className="res-btn">

      </div>

      

      <div className="reports-container">

       


      </div>

    </div>
  );
};

export default Reports;
