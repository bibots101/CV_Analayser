import React from 'react';

export const AttachmentPage = ({ apply }) => {
    const cv_file = apply.cv_uploaded;
    const getFileDetails = (base64String) => {
        const binaryData = atob(base64String);
        
        const fileName = apply.cv_file_name || "Unknown"; 
        

        const fileSize = (binaryData.length / 1024).toFixed(2); 
        
        return { fileName, fileSize};
    }; 

    const { fileName, fileSize} = getFileDetails(cv_file);

    const handleDownload = () => {
        const binaryData = atob(cv_file);
        
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }
        
        const blob = new Blob([uint8Array], { type: 'application/pdf' });
    
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; 
        document.body.appendChild(link);
    
        link.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    };

    return (
        <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
            <div className="flex w-0 flex-1 items-center">
                <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clipRule="evenodd" />
                </svg>
                <div className="ml-4 flex min-w-0 flex-1 gap-2">
                    <span className="truncate font-medium">{fileName}</span>
                    <span className="flex-shrink-0 text-gray-400">{fileSize} KB</span>
                    <span className="text-blue-400 text-lg text-bg-primary badge items-center ms-14">{"Score : "+ apply.score.toFixed(2)}</span>
                </div>
            </div>
            <div className="ml-4 flex-shrink-0">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500" onClick={handleDownload}>Download</a>
            </div>
        </li>
    );
};
