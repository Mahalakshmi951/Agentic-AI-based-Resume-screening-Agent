import React, { useState, useRef } from "react";
import { Upload, FileText, Loader2, Download, Briefcase, ChevronRight, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalyzeResumes } from "@workspace/api-client-react";
import writeXlsxFile from "write-excel-file/browser";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Home() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState(null);
  const [resumes, setResumes] = useState([]);

  const jdInputRef = useRef(null);
  const resumesInputRef = useRef(null);

  const analyzeMutation = useAnalyzeResumes();

  const handleJdDrop = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setJobDescription(e.target.files[0]);
    }
  };

  const handleResumesDrop = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumes(Array.from(e.target.files));
    }
  };

  const triggerAnalysis = async () => {
    if (!jobDescription) {
      toast({ title: "Missing Job Description", description: "Please upload a job description PDF.", variant: "destructive" });
      return;
    }
    if (resumes.length === 0) {
      toast({ title: "Missing Resumes", description: "Please upload at least one resume PDF.", variant: "destructive" });
      return;
    }

    try {
      const jdBase64 = await toBase64(jobDescription);
      const resumesBase64 = await Promise.all(resumes.map((r) => toBase64(r)));
      const resumeNames = resumes.map((r) => r.name);

      analyzeMutation.mutate({
        data: {
          jobDescriptionBase64: jdBase64,
          jobDescriptionName: jobDescription.name,
          resumesBase64,
          resumeNames
        }
      }, {
        onSuccess: () => {
          toast({ title: "Analysis Complete", description: `Successfully analyzed ${resumes.length} candidates.` });
        },
        onError: (error) => {
          toast({ title: "Analysis Failed", description: error.error || "An error occurred during analysis.", variant: "destructive" });
        }
      });
    } catch (err) {
      toast({ title: "File Error", description: "Failed to read files.", variant: "destructive" });
    }
  };

  const exportToExcel = async () => {
    if (!analyzeMutation.data?.results) return;

    const headers = ["Name", "Type", "Email", "Contact", "TopThreeSkills", "Summary", "Pros", "Cons", "Rating"];
    const headerRow = headers.map((h) => ({ value: h, fontWeight: "bold" }));

    const dataRows = analyzeMutation.data.results.map((r) => [
    { value: r.name ?? "" },
    { value: r.type ?? "" },
    { value: r.email ?? "" },
    { value: r.contact ?? "" },
    { value: Array.isArray(r.topThreeSkills) ? r.topThreeSkills.join(", ") : r.topThreeSkills ?? "" },
    { value: r.summary ?? "" },
    { value: r.pros ?? "" },
    { value: r.cons ?? "" },
    { value: String(r.rating ?? "") }]
    );

    const dateStr = new Date().toISOString().split('T')[0];
    await writeXlsxFile([headerRow, ...dataRows], {
      fileName: `recruitment_results_${dateStr}.xlsx`
    });
  };

  const getDecisionBadge = (decision) => {
    const d = decision.toLowerCase();
    if (d.includes("selected")) return /*#__PURE__*/_jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200", children: "Selected" });
    if (d.includes("review")) return /*#__PURE__*/_jsx(Badge, { className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200", children: "Review" });
    if (d.includes("rejected")) return /*#__PURE__*/_jsx(Badge, { className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200", children: "Rejected" });
    return /*#__PURE__*/_jsx(Badge, { variant: "outline", children: decision });
  };

  return (/*#__PURE__*/
    _jsxs("div", { className: "min-h-[100dvh] bg-slate-50", children: [/*#__PURE__*/
      _jsx("header", { className: "border-b bg-white border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm", children: /*#__PURE__*/
        _jsxs("div", { className: "flex items-center gap-2", children: [/*#__PURE__*/
          _jsx("div", { className: "bg-blue-600 p-2 rounded-md", children: /*#__PURE__*/
            _jsx(Briefcase, { className: "w-5 h-5 text-white" }) }
          ), /*#__PURE__*/
          _jsxs("div", { children: [/*#__PURE__*/
            _jsx("h1", { className: "font-bold text-lg text-slate-900 tracking-tight leading-none", children: "AI Recruiter" }), /*#__PURE__*/
            _jsx("p", { className: "text-xs text-slate-500 font-medium mt-0.5", children: "Intelligent Candidate Analysis" })] }
          )] }
        ) }
      ), /*#__PURE__*/

      _jsxs("main", { className: "max-w-7xl mx-auto px-6 py-8 space-y-8", children: [/*#__PURE__*/

        _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [/*#__PURE__*/
          _jsxs(Card, { className: "border-slate-200 shadow-sm", children: [/*#__PURE__*/
            _jsxs(CardHeader, { className: "pb-4", children: [/*#__PURE__*/
              _jsx(CardTitle, { className: "text-lg", children: "1. Job Description" }), /*#__PURE__*/
              _jsx(CardDescription, { children: "Upload the requirements" })] }
            ), /*#__PURE__*/
            _jsx(CardContent, { children: /*#__PURE__*/
              _jsxs("div", {
                className: `border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${jobDescription ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`,
                onClick: () => jdInputRef.current?.click(), children: [/*#__PURE__*/

                _jsx("input", { type: "file", accept: "application/pdf", className: "hidden", ref: jdInputRef, onChange: handleJdDrop }), /*#__PURE__*/
                _jsx(FileText, { className: `w-8 h-8 mx-auto mb-3 ${jobDescription ? 'text-blue-500' : 'text-slate-400'}` }),
                jobDescription ? /*#__PURE__*/
                _jsxs("div", { children: [/*#__PURE__*/
                  _jsx("p", { className: "font-medium text-slate-900 text-sm", children: jobDescription.name }), /*#__PURE__*/
                  _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Ready for analysis" })] }
                ) : /*#__PURE__*/

                _jsxs("div", { children: [/*#__PURE__*/
                  _jsx("p", { className: "font-medium text-slate-700 text-sm", children: "Drop PDF here or click to browse" }), /*#__PURE__*/
                  _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Only .pdf files supported" })] }
                )] }

              ) }
            )] }
          ), /*#__PURE__*/

          _jsxs(Card, { className: "border-slate-200 shadow-sm", children: [/*#__PURE__*/
            _jsxs(CardHeader, { className: "pb-4", children: [/*#__PURE__*/
              _jsx(CardTitle, { className: "text-lg", children: "2. Candidate Resumes" }), /*#__PURE__*/
              _jsx(CardDescription, { children: "Upload candidates to evaluate" })] }
            ), /*#__PURE__*/
            _jsx(CardContent, { children: /*#__PURE__*/
              _jsxs("div", {
                className: `border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${resumes.length > 0 ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`,
                onClick: () => resumesInputRef.current?.click(), children: [/*#__PURE__*/

                _jsx("input", { type: "file", accept: "application/pdf", multiple: true, className: "hidden", ref: resumesInputRef, onChange: handleResumesDrop }), /*#__PURE__*/
                _jsx(Upload, { className: `w-8 h-8 mx-auto mb-3 ${resumes.length > 0 ? 'text-blue-500' : 'text-slate-400'}` }),
                resumes.length > 0 ? /*#__PURE__*/
                _jsxs("div", { children: [/*#__PURE__*/
                  _jsxs("p", { className: "font-medium text-slate-900 text-sm", children: [resumes.length, " candidates selected"] }), /*#__PURE__*/
                  _jsx("p", { className: "text-xs text-slate-500 mt-1 line-clamp-1", children:
                    resumes.map((r) => r.name).join(', ') }
                  )] }
                ) : /*#__PURE__*/

                _jsxs("div", { children: [/*#__PURE__*/
                  _jsx("p", { className: "font-medium text-slate-700 text-sm", children: "Drop PDFs here or click to browse" }), /*#__PURE__*/
                  _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Upload multiple .pdf files" })] }
                )] }

              ) }
            )] }
          )] }
        ), /*#__PURE__*/

        _jsx("div", { className: "flex justify-center py-4", children: /*#__PURE__*/
          _jsx(Button, {
            size: "lg",
            className: "w-full md:w-auto min-w-[240px] shadow-sm text-base h-12",
            onClick: triggerAnalysis,
            disabled: analyzeMutation.isPending || !jobDescription || resumes.length === 0, children:

            analyzeMutation.isPending ? /*#__PURE__*/
            _jsxs(_Fragment, { children: [/*#__PURE__*/
              _jsx(Loader2, { className: "w-5 h-5 mr-2 animate-spin" }), "Analyzing Candidates..."] }

            ) : /*#__PURE__*/

            _jsxs(_Fragment, { children: ["Analyze Match ", /*#__PURE__*/
              _jsx(ChevronRight, { className: "w-5 h-5 ml-1" })] }
            ) }

          ) }
        ),

        analyzeMutation.data?.results && /*#__PURE__*/
        _jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500", children: [/*#__PURE__*/
          _jsxs("div", { className: "flex items-center justify-between", children: [/*#__PURE__*/
            _jsxs("div", { className: "flex items-center gap-2", children: [/*#__PURE__*/
              _jsx(BarChart2, { className: "w-5 h-5 text-slate-700" }), /*#__PURE__*/
              _jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Analysis Results" })] }
            ), /*#__PURE__*/
            _jsxs(Button, { variant: "outline", onClick: exportToExcel, className: "bg-white shadow-sm border-slate-200", children: [/*#__PURE__*/
              _jsx(Download, { className: "w-4 h-4 mr-2" }), "Export to Excel"] }

            )] }
          ), /*#__PURE__*/

          _jsx(Card, { className: "border-slate-200 shadow-sm overflow-hidden", children: /*#__PURE__*/
            _jsx("div", { className: "overflow-x-auto", children: /*#__PURE__*/
              _jsxs(Table, { children: [/*#__PURE__*/
                _jsx(TableHeader, { className: "bg-slate-50", children: /*#__PURE__*/
                  _jsxs(TableRow, { className: "border-slate-200 hover:bg-slate-50", children: [/*#__PURE__*/
                    _jsx(TableHead, { className: "font-semibold text-slate-700", children: "Candidate" }), /*#__PURE__*/
                    _jsx(TableHead, { className: "font-semibold text-slate-700", children: "Score" }), /*#__PURE__*/
                    _jsx(TableHead, { className: "font-semibold text-slate-700", children: "Decision" }), /*#__PURE__*/
                    _jsx(TableHead, { className: "font-semibold text-slate-700 hidden lg:table-cell", children: "Top Skills" }), /*#__PURE__*/
                    _jsx(TableHead, { className: "font-semibold text-slate-700 hidden xl:table-cell min-w-[300px]", children: "Summary" })] }
                  ) }
                ), /*#__PURE__*/
                _jsx(TableBody, { children:
                  analyzeMutation.data.results.map((candidate, idx) => /*#__PURE__*/
                  _jsxs(TableRow, { className: "border-slate-100 hover:bg-slate-50/50", children: [/*#__PURE__*/
                    _jsxs(TableCell, { className: "align-top py-4", children: [/*#__PURE__*/
                      _jsx("p", { className: "font-semibold text-slate-900", children: candidate.name }), /*#__PURE__*/
                      _jsx("p", { className: "text-xs text-slate-500 mt-1", children: candidate.type }), /*#__PURE__*/
                      _jsxs("div", { className: "mt-2 space-y-0.5", children: [/*#__PURE__*/
                        _jsx("p", { className: "text-xs text-slate-500 truncate", children: candidate.email }), /*#__PURE__*/
                        _jsx("p", { className: "text-xs text-slate-500", children: candidate.contact })] }
                      )] }
                    ), /*#__PURE__*/
                    _jsx(TableCell, { className: "align-top py-4", children: /*#__PURE__*/
                      _jsxs("div", { className: "flex flex-col gap-1", children: [/*#__PURE__*/
                        _jsxs("span", { className: "font-bold text-lg text-slate-900", children: [candidate.matchScore, "%"] }), /*#__PURE__*/
                        _jsxs("span", { className: "text-xs font-medium text-slate-500", children: ["Rating: ", candidate.rating, "/10"] })] }
                      ) }
                    ), /*#__PURE__*/
                    _jsx(TableCell, { className: "align-top py-4", children:
                      getDecisionBadge(candidate.decision) }
                    ), /*#__PURE__*/
                    _jsx(TableCell, { className: "align-top py-4 hidden lg:table-cell", children: /*#__PURE__*/
                      _jsx("div", { className: "flex flex-wrap gap-1 max-w-[200px]", children:
                        candidate.topThreeSkills.split(',').map((skill, sIdx) => /*#__PURE__*/
                        _jsx(Badge, { variant: "secondary", className: "bg-slate-100 text-slate-700 font-normal hover:bg-slate-200 border-transparent", children:
                          skill.trim() }, sIdx
                        )
                        ) }
                      ) }
                    ), /*#__PURE__*/
                    _jsxs(TableCell, { className: "align-top py-4 hidden xl:table-cell", children: [/*#__PURE__*/
                      _jsx("p", { className: "text-sm text-slate-600 line-clamp-3", children: candidate.summary }), /*#__PURE__*/
                      _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-3", children: [/*#__PURE__*/
                        _jsxs("div", { children: [/*#__PURE__*/
                          _jsx("p", { className: "text-xs font-semibold text-emerald-700 mb-1", children: "Pros" }), /*#__PURE__*/
                          _jsx("p", { className: "text-xs text-slate-600 line-clamp-2", children: candidate.pros })] }
                        ), /*#__PURE__*/
                        _jsxs("div", { children: [/*#__PURE__*/
                          _jsx("p", { className: "text-xs font-semibold text-rose-700 mb-1", children: "Cons" }), /*#__PURE__*/
                          _jsx("p", { className: "text-xs text-slate-600 line-clamp-2", children: candidate.cons })] }
                        )] }
                      )] }
                    )] }, idx
                  )
                  ) }
                )] }
              ) }
            ) }
          )] }
        )] }

      )] }
    ));

}