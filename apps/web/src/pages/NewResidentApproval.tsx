import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFile, removeFile } from "../redux/slice/newResidentApprovalSlice";
import type { RootState, AppDispatch } from "../redux/store"; 
import { PDFDocument } from "pdf-lib";

const NewResidentApproval: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { files } = useSelector((state: RootState) => state.newResidentApproval);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");

  const generateUniqueId = (file: File) => `${file.name}-${file.lastModified}`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const isDuplicate = files.some((f: { id: string }) => f.id === generateUniqueId(file));
      if (isDuplicate) {
        setErrorMessage("הקובץ כבר הועלה.");
      } else {
        setFileInput(file);
        setErrorMessage(null);
      }
    }
  };

  const convertToPdf = async (file: File): Promise<string> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(file.name, { x: 50, y: 350 });
  
    const pdfBytes = await pdfDoc.save();
  
    const buffer: ArrayBuffer =
      pdfBytes.buffer instanceof SharedArrayBuffer
        ? new Uint8Array(pdfBytes).buffer
        : pdfBytes.buffer;
  
    const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
  
    return URL.createObjectURL(blob);
  };
  
  const handleUpload = async () => {
    if (fileInput) {
      setUploadLoading(true);
      setErrorMessage(null);
      try {
        const pdfUrl = await convertToPdf(fileInput);
        const uniqueId = generateUniqueId(fileInput);
        dispatch(addFile({ 
          id: uniqueId, 
          name: fileInput.name, 
          url: pdfUrl
        }));
        setSuccessMessage("הקובץ הועלה בהצלחה!");
        setFileInput(null);
      } catch (error) {
        setErrorMessage("אירעה שגיאה בהעלאת הקובץ.");
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    dispatch(removeFile(fileId));
  };

  const handleAcceptanceTest = () => {
    setIsApproved(true);
    setErrorMessage(null);
  };

  const validateName = (name: string) => /^[a-zA-Z\u0590-\u05FF\s]+$/.test(name);
  const validateId = (id: string) => /^[0-9]{9}$/.test(id);

  return (
    <div className="container mt-5" style={{ paddingTop: '80px', backgroundColor: '#f8f9fa' }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card" style={{ backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-header text-center">
              <h3>אישור דיירים חדשים</h3>
            </div>
            <div className="card-body">
              {/* העלאת קבצים */}
              <div className="mb-4">
                <h5>העלאת מסמכים</h5>
                <div className="mb-3">
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={handleFileUpload}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpload} 
                  disabled={!fileInput || uploadLoading}
                >
                  {uploadLoading ? "מעלה..." : "העלה קובץ"}
                </button>
              </div>

              {/* הודעות */}
              {errorMessage && (
                <div className="alert alert-danger">
                  {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success">
                  {successMessage}
                </div>
              )}

              {/* רשימת קבצים */}
              {files.length > 0 && (
                <div className="mb-4">
                  <h5>קבצים שהועלו</h5>
                  <ul className="list-group">
                    {files.map((file) => (
                      <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          {file.name}
                        </a>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          מחק
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* טופס פרטי דייר */}
              <div className="mb-4">
                <h5>פרטי הדייר</h5>
                <form>
                  <div className="mb-3">
                    <label className="form-label">שם מלא</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => !validateName(name) && setErrorMessage("שם מלא לא תקין.")}
                      placeholder="הזן שם מלא"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">מספר תעודת זהות</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      onBlur={() => !validateId(id) && setErrorMessage("תעודת זהות לא תקינה.")}
                      placeholder="הזן 9 ספרות"
                      maxLength={9}
                    />
                  </div>

                  <div className="text-center">
                    <button 
                      type="button" 
                      className="btn btn-success" 
                      onClick={handleAcceptanceTest}
                    >
                      הגש מבחן קבלה
                    </button>
                  </div>
                </form>
              </div>

              {/* הודעת אישור */}
              {isApproved && (
                <div className="alert alert-success text-center">
                  <strong>ברוך הבא!</strong> הדייר עבר את מבחן הקבלה.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewResidentApproval;
