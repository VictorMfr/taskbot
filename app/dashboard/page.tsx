"use client";

import { useEffect } from "react";
import { Box, Container, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Header from "@/components/LandingPage/Header";
import MainContent from "../../components/dashboard/MainContent";
import Sidebar from "../../components/dashboard/Sidebar";


export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header />
      <Box sx={{ display: "flex", flexDirection: "row", width: "100%", height: "90vh", maxWidth: "100vw", maxHeight: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
        <MainContent />
        <Sidebar />
      </Box>
    </>
  );
}