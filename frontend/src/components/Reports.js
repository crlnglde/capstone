import React, { useEffect, useState } from "react";

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

import axios from "axios";
import Modal from "./Modal"
import "../css/Reports.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Reports = () => {


return (
  <div className="reports">
      
    <div className="container">


    </div>

  </div>
);
};

export default Reports;
