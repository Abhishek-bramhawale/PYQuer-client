import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
// ArrowBackIcon, useParams, useNavigate, axios are not needed here as this component receives data via props.

const parseMarkdownTable = (text, section) => {
  if (!text || typeof text !== 'string') {
    console.warn(`Invalid text provided for ${section}:`, text);
    return [];
  }
  
  try {
    const sectionRegex = new RegExp(`${section}:\\s*\\n([\\s\\S]*?)(?=\\n\\d\\.|$)`);
    const match = text.match(sectionRegex);
    
    if (!match || !match[1]) {
      console.warn(`No content found for section ${section}`);
      return [];
    }
    
    const content = match[1].trim();
    
    if (content.startsWith('No ') && content.includes('found')) {
      return { isEmpty: true, message: content };
    }
    
    const tableMatch = content.match(/\|.*\n\|[-|]+\n([\s\S]*?)(?=\n\d\.|$)/);
    if (!tableMatch) {
      return { isEmpty: true, message: content };
    }
    
    const tableContent = tableMatch[1].trim();
    if (!tableContent) {
      return { isEmpty: true, message: 'No data found' };
    }
    
    const lines = tableContent.split('\n');
    
    return lines.map(line => {
      if (!line || !line.trim()) return null;
      
      const cells = line.split('|')
        .filter(cell => cell && cell.trim())
        .map(cell => cell.trim());
      
      if (section === '1. Repeated Questions Analysis') {
        if (cells.length >= 3) {
          return {
            question: cells[0] || '',
            count: cells[1] || '',
            papers: cells[2] || ''
          };
        }
      } else {
        if (cells.length >= 2) {
          return {
            question: cells[0] || '',
            papers: cells[1] || ''
          };
        }
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error(`Error parsing table for section ${section}:`, error);
    return [];
  }
};

const parseQuestionWiseAnalysis = (text) => {
  if (!text) return '';
  const sectionRegex = /4\. Remaining Questions:\n([\s\S]*?)(?=\n5\.|$) /;
  const match = text.match(sectionRegex);
  if (!match) return '';
  return match[1].trim();
};

const parseStudyRecommendations = (text) => {
  if (!text) return '';
  const sectionRegex = /5\. Study Recommendations:\s*\n([\s\S]*)$/;
  const match = text.match(sectionRegex);
  if (!match) return '';
  return match[1].trim();
};

const AnalysisResults = ({ analysis, isLoading, error }) => {
  if (!analysis || typeof analysis !== 'object') {
    console.warn('Invalid analysis prop:', analysis);
    return null;
  }

  if (!analysis.analysis || typeof analysis.analysis !== 'string') {
    console.warn('Invalid analysis text:', analysis.analysis);
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        Invalid analysis data received
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing your papers...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        {error}
      </Alert>
    );
  }

  const rawAnalysisText = analysis.analysis;
  const repeatedQuestions = parseMarkdownTable(rawAnalysisText, '1. Repeated Questions Analysis');
  const differenceQuestions = parseMarkdownTable(rawAnalysisText, '2. Questions Asking for Differences');
  const diagramQuestions = parseMarkdownTable(rawAnalysisText, '3. Questions Requiring Diagrams');
  const questionWiseAnalysis = parseQuestionWiseAnalysis(rawAnalysisText);
  const studyRecommendations = parseStudyRecommendations(rawAnalysisText);

  const renderTableSection = (title, data, columns) => {
    if (!data || data.isEmpty) {
      return (
        <Box mt={4}>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            {title}
          </Typography>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography>{data?.message || 'No data available'}</Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <Box mt={4}>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell key={index}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>{row[col.toLowerCase().replace(/\s+/g, '')]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analysis Results
        </Typography>
        {/* Subject and Year info are not available directly from the analysis.analysis (raw text) unless you pass them as part of the `analysis` prop from FileUpload */}
        {/* For now, commenting out these lines as `analysis` only contains `analysis` (raw text) and `timestamp` */}
        {/* <Typography variant="h6" color="textSecondary" gutterBottom>
          {analysis.subject} - {analysis.year}
        </Typography> */}

        <Divider sx={{ my: 3 }} />

        {renderTableSection('1. Repeated Questions Analysis', repeatedQuestions, ['Question', 'Repeated Count', 'Papers Appeared'])}
        {renderTableSection('2. Questions Asking for Differences', differenceQuestions, ['Question', 'Papers Appeared'])}
        {renderTableSection('3. Questions Requiring Diagrams', diagramQuestions, ['Question', 'Papers Appeared'])}

        {/* Remaining Questions Section */}
        <Box mt={4}>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            4. Remaining Questions
          </Typography>
          <Paper sx={{ p: 2, mt: 2, whiteSpace: 'pre-wrap' }}>
            {questionWiseAnalysis}
          </Paper>
        </Box>

        {/* Study Recommendations Section */}
        <Box mt={4}>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            5. Study Recommendations
          </Typography>
          <Paper sx={{ p: 2, mt: 2, whiteSpace: 'pre-wrap' }}>
            {studyRecommendations}
          </Paper>
        </Box>

        {/* Analysis timestamp is available in `analysis.timestamp` (if passed correctly) */}
        {analysis.timestamp && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Analysis completed at: {new Date(analysis.timestamp).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalysisResults; 