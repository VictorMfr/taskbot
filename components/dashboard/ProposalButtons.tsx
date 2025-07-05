"use client";
import { Box, Button, Typography, Paper } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { ProposedChanges } from "@/hooks/useChatAI";

interface ProposalButtonsProps {
  proposal: ProposedChanges;
  onApprove: (proposalId: string) => Promise<boolean>;
  onReject: (proposalId: string) => Promise<boolean>;
  isProcessing?: boolean;
}

export default function ProposalButtons({ 
  proposal, 
  onApprove, 
  onReject, 
  isProcessing = false 
}: ProposalButtonsProps) {
  const handleApprove = async () => {
    await onApprove(proposal.id);
  };

  const handleReject = async () => {
    await onReject(proposal.id);
  };

  const getActionText = () => {
    switch (proposal.type) {
      case 'create':
        return `Crear ${proposal.entity === 'task' ? 'tarea' : 'subtarea'}`;
      case 'update':
        return `Actualizar ${proposal.entity === 'task' ? 'tarea' : 'subtarea'}`;
      case 'delete':
        return `Eliminar ${proposal.entity === 'task' ? 'tarea' : 'subtarea'}`;
      default:
        return 'Acción';
    }
  };

  const getDataPreview = () => {
    if (proposal.type === 'delete') {
      return `ID: ${proposal.data.id}`;
    }
    
    return proposal.data.nombre || 'Sin nombre';
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mt: 2, 
        border: '1px solid',
        borderColor: 'primary.main',
        backgroundColor: 'primary.50'
      }}
    >
      <Typography variant="subtitle2" color="primary" gutterBottom>
        {getActionText()}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        {proposal.description}: {getDataPreview()}
      </Typography>

      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<Check />}
          onClick={handleApprove}
          disabled={isProcessing}
        >
          Aprobar
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<Close />}
          onClick={handleReject}
          disabled={isProcessing}
        >
          Rechazar
        </Button>
      </Box>
    </Paper>
  );
} 