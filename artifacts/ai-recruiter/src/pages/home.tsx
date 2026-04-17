import React, { useState, useRef } from "react";
import { Upload, FileText, Loader2, Download, Briefcase, ChevronRight, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalyzeResumes } from "@workspace/api-client-react";
import * as XLSX from "xlsx";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function Home() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  
  const jdInputRef = useRef<HTMLInputElement>(null);
  const resumesInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useAnalyzeResumes();

  const handleJdDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setJobDescription(e.target.files[0]);
    }
  };

  const handleResumesDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const resumesBase64 = await Promise.all(resumes.map(r => toBase64(r)));
      const resumeNames = resumes.map(r => r.name);

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

  const exportToExcel = () => {
    if (!analyzeMutation.data?.results) return;

    const dataToExport = analyzeMutation.data.results.map(r => ({
      Name: r.name,
      Type: r.type,
      Email: r.email,
      Contact: r.contact,
      TopThreeSkills: r.topThreeSkills,
      Summary: r.summary,
      Pros: r.pros,
      Cons: r.cons,
      Rating: r.rating
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `recruitment_results_${dateStr}.xlsx`);
  };

  const getDecisionBadge = (decision: string) => {
    const d = decision.toLowerCase();
    if (d.includes("selected")) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Selected</Badge>;
    if (d.includes("review")) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Review</Badge>;
    if (d.includes("rejected")) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Rejected</Badge>;
    return <Badge variant="outline">{decision}</Badge>;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      <header className="border-b bg-white border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-md">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">AI Recruiter</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Intelligent Candidate Analysis</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">1. Job Description</CardTitle>
              <CardDescription>Upload the requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${jobDescription ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => jdInputRef.current?.click()}
              >
                <input type="file" accept="application/pdf" className="hidden" ref={jdInputRef} onChange={handleJdDrop} />
                <FileText className={`w-8 h-8 mx-auto mb-3 ${jobDescription ? 'text-blue-500' : 'text-slate-400'}`} />
                {jobDescription ? (
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{jobDescription.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Ready for analysis</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-700 text-sm">Drop PDF here or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Only .pdf files supported</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">2. Candidate Resumes</CardTitle>
              <CardDescription>Upload candidates to evaluate</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${resumes.length > 0 ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => resumesInputRef.current?.click()}
              >
                <input type="file" accept="application/pdf" multiple className="hidden" ref={resumesInputRef} onChange={handleResumesDrop} />
                <Upload className={`w-8 h-8 mx-auto mb-3 ${resumes.length > 0 ? 'text-blue-500' : 'text-slate-400'}`} />
                {resumes.length > 0 ? (
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{resumes.length} candidates selected</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {resumes.map(r => r.name).join(', ')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-slate-700 text-sm">Drop PDFs here or click to browse</p>
                    <p className="text-xs text-slate-500 mt-1">Upload multiple .pdf files</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center py-4">
          <Button 
            size="lg" 
            className="w-full md:w-auto min-w-[240px] shadow-sm text-base h-12"
            onClick={triggerAnalysis}
            disabled={analyzeMutation.isPending || !jobDescription || resumes.length === 0}
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Candidates...
              </>
            ) : (
              <>
                Analyze Match <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>

        {analyzeMutation.data?.results && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900">Analysis Results</h2>
              </div>
              <Button variant="outline" onClick={exportToExcel} className="bg-white shadow-sm border-slate-200">
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-slate-200 hover:bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                      <TableHead className="font-semibold text-slate-700">Score</TableHead>
                      <TableHead className="font-semibold text-slate-700">Decision</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden lg:table-cell">Top Skills</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden xl:table-cell min-w-[300px]">Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyzeMutation.data.results.map((candidate, idx) => (
                      <TableRow key={idx} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="align-top py-4">
                          <p className="font-semibold text-slate-900">{candidate.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{candidate.type}</p>
                          <div className="mt-2 space-y-0.5">
                            <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                            <p className="text-xs text-slate-500">{candidate.contact}</p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-lg text-slate-900">{candidate.matchScore}%</span>
                            <span className="text-xs font-medium text-slate-500">Rating: {candidate.rating}/10</span>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                          {getDecisionBadge(candidate.decision)}
                        </TableCell>
                        <TableCell className="align-top py-4 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {candidate.topThreeSkills.split(',').map((skill, sIdx) => (
                              <Badge key={sIdx} variant="secondary" className="bg-slate-100 text-slate-700 font-normal hover:bg-slate-200 border-transparent">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 hidden xl:table-cell">
                          <p className="text-sm text-slate-600 line-clamp-3">{candidate.summary}</p>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs font-semibold text-emerald-700 mb-1">Pros</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{candidate.pros}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-rose-700 mb-1">Cons</p>
                              <p className="text-xs text-slate-600 line-clamp-2">{candidate.cons}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}