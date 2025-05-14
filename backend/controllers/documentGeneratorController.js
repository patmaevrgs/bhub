// controllers/documentGeneratorController.js
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate document based on template and data (DOCX only)
export const generateDocument = async (req, res) => {
  try {
    const { documentType, formData, purpose, clearanceNumber } = req.body;
    
    // Determine which template to use based on document type
    let templatePath;
    switch(documentType) {
      case 'certificate_of_residency':
        templatePath = path.resolve(__dirname, '../templates/certificate_of_residency_template.docx');
        break;
      case 'barangay_clearance':
        templatePath = path.resolve(__dirname, '../templates/barangay_clearance_template.docx');
        break;
      case 'certificate_of_indigency':
        templatePath = path.resolve(__dirname, '../templates/certificate_of_indigency_template.docx');
        break;
      case 'lot_ownership':
        templatePath = path.resolve(__dirname, '../templates/lot_ownership_template.docx');
        break;
      case 'fencing_permit':
        templatePath = path.resolve(__dirname, '../templates/fencing_permit_template.docx');
        break;
      case 'digging_permit':
        templatePath = path.resolve(__dirname, '../templates/digging_permit_template.docx');
        break;
      case 'business_clearance':
        templatePath = path.resolve(__dirname, '../templates/business_clearance_template.docx');
        break;
      case 'no_objection_certificate':
        templatePath = path.resolve(__dirname, '../templates/no_objection_certificate_template.docx');
        break;
      case 'request_for_assistance':
        templatePath = path.resolve(__dirname, '../templates/request_for_assistance_template.docx');
        break;
      case 'barangay_id':
        templatePath = path.resolve(__dirname, '../templates/barangay_id_template.docx');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported document type'
        });
    }
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document template not found'
      });
    }
    
    // Read the template file content
    const content = fs.readFileSync(templatePath, 'binary');
    
    // Create a zip of the loaded file
    const zip = new PizZip(content);
    
    // Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };
    
    // Get ordinal suffix for day of month
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    // Current date for signing
    const currentDate = new Date();
    const dayWithSuffix = `${currentDate.getDate()}${getOrdinalSuffix(currentDate.getDate())}`;
    const formattedMonth = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const signedDate = `${dayWithSuffix} day of ${formattedMonth}, ${year}`;
    
    // Format age in words (for Certificate of Indigency)
    const ageInWords = (age) => {
      const ageNum = parseInt(age);
      // Filipino number words (for common ages)
      const tagalogNumbers = {
        1: 'isa', 2: 'dalawa', 3: 'tatlo', 4: 'apat', 5: 'lima',
        6: 'anim', 7: 'pito', 8: 'walo', 9: 'siyam', 10: 'sampu',
        11: 'labing-isa', 12: 'labing-dalawa', 13: 'labing-tatlo', 
        14: 'labing-apat', 15: 'labing-lima', 16: 'labing-anim',
        17: 'labing-pito', 18: 'labing-walo', 19: 'labing-siyam',
        20: 'dalawampu', 30: 'tatlumpu', 40: 'apatnapu', 
        50: 'limampu', 60: 'animnapu', 70: 'pitumpu',
        80: 'walumpu', 90: 'siyamnapu', 100: 'isandaan'
      };
      
      // If we have a direct translation
      if (tagalogNumbers[ageNum]) {
        return tagalogNumbers[ageNum];
      }
      
      // Handle ages 21-99 not included above
      if (ageNum > 20 && ageNum < 100) {
        const tens = Math.floor(ageNum / 10) * 10;
        const ones = ageNum % 10;
        
        if (ones === 0) {
          return tagalogNumbers[tens];
        } else {
          return `${tagalogNumbers[tens]} at ${tagalogNumbers[ones]}`;
        }
      }
      
      // If we can't translate to Filipino, just return the number
      return age;
    };
    
    // Get Filipino date format
    const getFilipinoDate = () => {
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const year = currentDate.getFullYear();
      
      // Filipino month names
      const filipinoMonths = [
        '', 'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
        'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'
      ];
      
      return `${day} ng ${filipinoMonths[month]}, ${year}`;
    };
    
    // Prepare data for template
    let data = {
      signedDate: signedDate,
      currentDay: currentDate.getDate(),
      currentMonth: formattedMonth,
      currentYear: year,
      fullDate: `${formattedMonth} ${currentDate.getDate()}, ${year}`,
      filipinoDate: getFilipinoDate(),
      purpose: purpose || '',
    };
    
    // Add document type specific data
    if (documentType === 'certificate_of_residency') {
      data = {
        ...data,
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        age: formData.age || '',
        dateOfBirth: formatDate(formData.dateOfBirth) || '',
        placeOfBirth: formData.placeOfBirth || '',
        nationality: formData.nationality || '',
        civilStatus: formData.civilStatus || '',
        motherName: formData.motherName || '',
        fatherName: formData.fatherName || '',
        yearsOfStay: formData.yearsOfStay || '',
      };
    } 
    else if (documentType === 'barangay_clearance') {
      // Determine pronoun based on gender
      const gender = formData.gender?.toLowerCase() || 'male';
      const genderPronoun = gender === 'male' ? 'he' : 'she';
      const genderPossessive = gender === 'male' ? 'his' : 'her';
      const genderObject = gender === 'male' ? 'him' : 'her';
      
      data = {
        ...data,
        clearanceNumber: clearanceNumber || '', // Use admin-provided clearance number
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        gender: genderObject, // For pronoun in template (him/her)
        genderPronoun: genderPronoun, // For pronoun in template (he/she)
        genderPossessive: genderPossessive, // For possessive pronoun in template (his/her)
      };
    }
    else if (documentType === 'certificate_of_indigency') {
      // If the certificate is for self-use (isSelf is true), modify the template text
      const isSelf = formData.isSelf === true;
      
      data = {
        ...data,
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        age: formData.age || '',
        ageInWords: ageInWords(formData.age) || '',
        guardian: formData.guardian?.toUpperCase() || (isSelf ? formData.fullName?.toUpperCase() : ''),
        guardianRelation: formData.guardianRelation || (isSelf ? 'SARILI (SELF)' : ''),
        // Add a flag for self application to potentially modify template text
        isSelf: isSelf,
        // For self application, change the text "Ipinagkakaloob ko ang pagpapatunay na ito kay"
        recipientText: isSelf ? 
          'Ipinagkakaloob ko ang pagpapatunay na ito sa kanya mismo' : 
          'Ipinagkakaloob ko ang pagpapatunay na ito kay',
        // Add the guardianRelationText variable
        guardianRelationText: isSelf ? '' : ` (${formData.guardianRelation})`
      };
    }
    else if (documentType === 'lot_ownership') {
      // Get area unit in readable format
      const areaUnitText = (() => {
        switch(formData.areaUnit) {
          case 'square_meters': 
            return 'square meters';
          case 'square_feet': 
            return 'square feet';
          case 'hectares': 
            return 'hectares';
          default: 
            return formData.areaUnit;
        }
      })();
      
      data = {
        ...data,
        tdNumber: formData.tdNumber || '',
        surveyNumber: formData.surveyNumber || '',
        lotArea: formData.lotArea || '',
        areaUnit: areaUnitText,
        lotLocation: formData.lotLocation || '',
        fullName: formData.fullName?.toUpperCase() || '',
        ownerAddress: formData.ownerAddress || '',
        signedDate: signedDate
      };
    }
    
    else if (documentType === 'fencing_permit') {
      // Get area unit in readable format
      const areaUnitText = (() => {
        switch(formData.areaUnit) {
          case 'square_meters': 
            return 'square meters';
          case 'square_feet': 
            return 'square feet';
          case 'hectares': 
            return 'hectares';
          default: 
            return formData.areaUnit;
        }
      })();
      
      data = {
        ...data,
        fullName: formData.fullName || '',
        residentAddress: formData.residentAddress || '',
        propertyLocation: formData.propertyLocation || '', // Changed from propertyAddress
        taxDeclarationNumber: formData.taxDeclarationNumber || '',
        propertyIdentificationNumber: formData.propertyIdentificationNumber || '',
        propertyArea: formData.propertyArea || '',
        areaUnit: areaUnitText,
        signedDate: signedDate
        // The purpose is fixed as "installation of Fence" in the template
      };
    }
    else if (documentType === 'digging_permit') {
      // Format digging purpose text
      const purposeText = formData.purposeText || 'to dig across the road';
      const applicationText = formData.applicationText || '';
      
      data = {
        ...data,
        fullName: formData.fullName || '',
        address: formData.address || '',
        purposeText: purposeText,
        applicationText: applicationText,
        signedDate: signedDate
      };
    }

    else if (documentType === 'business_clearance') {
      // Allow admin to update the amount value through the req.body
      const amount = req.body.amount || formData.amount || '300.00';
      
      data = {
        ...data,
        businessName: formData.businessName || '',
        businessAddress: formData.businessAddress || '',
        lineOfBusiness: formData.lineOfBusiness || '',
        businessStatus: formData.businessStatus || 'NEW',
        amount: amount,
        signedDate: signedDate
      };
    }

    else if (documentType === 'request_for_assistance') {
      // Format the marginalized group for display
      const marginGroupText = (() => {
        switch(formData.marginGroupType) {
          case 'urban_poor': return 'URBAN POOR';
          case 'senior_citizen': return 'SENIOR CITIZEN';
          case 'single_parent': return 'SINGLE PARENT';
          case 'pwd': return 'PERSON WITH DISABILITY (PWD)';
          case 'indigenous': return 'INDIGENOUS PERSON';
          case 'solo_parent': return 'SOLO PARENT';
          case 'other': return 'OTHER';
          default: return formData.marginGroupType?.toUpperCase() || 'URBAN POOR';
        }
      })();
      
      // Format assistance type for display
      const assistanceTypeText = (() => {
        switch(formData.assistanceType) {
          case 'financial': return 'financial';
          case 'medical': return 'medical';
          case 'burial': return 'burial';
          case 'educational': return 'educational';
          case 'food': return 'food';
          case 'housing': return 'housing';
          case 'other': return formData.otherAssistanceType || 'assistance';
          default: return formData.assistanceType || 'financial';
        }
      })();
      
      // Determine if the request is for self or other person
      const isSelf = formData.isSelf === true;
      
      // Empty beneficiary fields if request is for self
      const beneficiaryName = isSelf ? '' : (formData.beneficiaryName?.toUpperCase() || '');
      const beneficiaryRelation = isSelf ? '' : (formData.beneficiaryRelation || '');
      
      // Set data for the template
      data = {
        ...data,
        fullName: formData.fullName?.toUpperCase() || '',
        address: formData.address || '',
        yearsOfStay: formData.yearsOfStay || '',
        marginGroupType: marginGroupText,
        // For self, display "himself/herself" in the template
        beneficiaryText: isSelf ? 'himself/herself.' : `(${beneficiaryRelation})`,
        // For self, do not display beneficiary name and relation
        beneficiaryName: beneficiaryName,
        beneficiaryRelation: beneficiaryRelation,
        // Hide beneficiary line if for self
        showBeneficiary: !isSelf,
        assistanceTypeText: assistanceTypeText,
        signedDate: signedDate
      };
    }

    else if (documentType === 'no_objection_certificate') {
      // Format the purpose text based on the object type
      const purposeText = purpose || 'will proceed with the stated activity. This office has no objection as part of local permitting requirements.';
      
      data = {
        ...data,
        fullName: formData.fullName || '',
        address: formData.address || '',
        purposeText: purposeText,
        signedDate: signedDate
      };
    }

    else if (documentType === 'barangay_id') {
      // Allow admin to update the ID number value through the req.body
      const idNumber = req.body.idNumber || '';
      
      data = {
        ...data,
        idNumber: idNumber, // This is provided by admin when generating
        firstName: formData.firstName?.toUpperCase() || '',
        middleName: formData.middleName?.toUpperCase() || '',
        lastName: formData.lastName?.toUpperCase() || '',
        address: formData.address || '',
        birthDate: formData.birthDate || '',
        emergencyContactName: formData.emergencyContactName || '',
        emergencyContactNumber: formData.emergencyContactNumber || '',
        fullDate: `${formattedMonth} ${currentDate.getDate()}, ${year}`,
      };
    }
    
    // Render document with data
    doc.render(data);
    
    // Generate output
    const outputDocx = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE'
    });
    
    // Create a unique filename
    const timestamp = Date.now();
    const docxFilename = `${documentType}_${timestamp}.docx`;
    
    // Send the DOCX file directly to the client
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${docxFilename}`);
    res.send(outputDocx);
    
  } catch (error) {
    console.error('Error generating document:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating document',
      error: error.message
    });
  }
};