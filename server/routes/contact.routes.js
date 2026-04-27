import express from "express";
import { submitContactForm, getContactInfo } from "../controllers/contact.controller.js";

const router = express.Router();
router.post("/", submitContactForm);
router.get("/info", getContactInfo);

export default router;