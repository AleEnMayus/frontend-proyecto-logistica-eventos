import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import HeaderCl from "../../components/HeaderSidebar/HeaderCl";
import "../CSS/FormsUser.css";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

const ClientSurvey = () => {
  const { eventId } = useParams();
  const { toasts, addToast, removeToast } = useToast();

  const [userId, setUserId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hover, setHover] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const defaultQuestions = [
  ];

  useEffect(() => {
    // Obtener ID de usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserId(storedUser?.id || 4); // fallback por defecto 4
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await api.get("/questions");
      const data = res.data;

      let questionsToUse = [];
      if (data && Array.isArray(data) && data.length > 0) {
        questionsToUse = data.map((q, idx) => {
          const id = q?.QuestionId || q?._id || q?.id || `q_${idx}`;
          const text = q?.QuestionText || q?.text || q?.question || `Pregunta ${idx + 1}`;
          return { ...q, _qid: id, _text: text };
        });
      } else {
        questionsToUse = defaultQuestions;
      }

      const initialAnswers = {};
      questionsToUse.forEach(q => { initialAnswers[q._qid] = 0; });

      setQuestions(questionsToUse);
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error cargando preguntas:", err);
      const initialAnswers = {};
      defaultQuestions.forEach(q => { initialAnswers[q._qid] = 0; });
      setQuestions(defaultQuestions);
      setAnswers(initialAnswers);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const renderStars = (questionId) => {
    const rating = answers[questionId] ?? 0;
    const preview = hover[questionId] ?? 0;
    const display = preview || rating;

    return Array.from({ length: 5 }, (_, i) => {
      const value = i + 1;
      return (
        <svg
          key={`${questionId}-${i}`}
          onClick={() => setAnswers(prev => ({ ...prev, [questionId]: value }))}
          onMouseEnter={() => setHover(prev => ({ ...prev, [questionId]: value }))}
          onMouseLeave={() => setHover(prev => ({ ...prev, [questionId]: 0 }))}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="28"
          height="28"
          style={{
            margin: "0 3px",
            cursor: "pointer",
            color: value <= display ? "#ffc107" : "#e0e0e0",
            transition: "color 0.2s ease",
          }}
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fill="currentColor"
          />
        </svg>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) return addToast("No se encontró el ID de usuario", "danger");
    if (!eventId) return addToast("No se encontró el ID del evento", "danger");

    const unanswered = Object.entries(answers)
      .filter(([_, val]) => val === 0)
      .map(([qid]) => {
        const question = questions.find(q => q._qid === qid);
        return question ? question._text : `Pregunta ${qid}`;
      });

    if (unanswered.length > 0) {
      return addToast(`Por favor, responde las siguientes preguntas:\n${unanswered.join('\n')}`, "warning");
    }

    setLoading(true);

    try {
      const res = await api.post("/survey", {
        EventId: eventId,
        UserId: userId,
        Answers: answers
      });

      const data = res.data;
      addToast("¡Encuesta enviada con éxito!", "success");

      const resetAnswers = {};
      questions.forEach(q => { resetAnswers[q._qid] = 0; });
      setAnswers(resetAnswers);
      setHover({});
    } catch (err) {
      console.error("Error al enviar encuesta:", err);
      addToast(err.response?.data?.error || err.message || "Error inesperado al enviar la encuesta", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="survey-main-container">
      <HeaderCl />
      <div className="survey-container">
        <h2 className="survey-title">Encuesta de Satisfacción</h2>
        <div className="debug-info" style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
          ID de usuario: {userId} | ID de evento: {eventId}
          {loadingQuestions && " | Cargando preguntas..."}
        </div>

        <form onSubmit={handleSubmit} className="survey-form">
          {loadingQuestions ? (
            <p>Cargando preguntas...</p>
          ) : questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={q._qid} className="survey-question-block">
                <p className="survey-question">{index + 1}. {q._text}</p>
                <div className="stars">{renderStars(q._qid)}</div>
                <div className="rating-display" style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
                  Calificación seleccionada: <strong>{answers[q._qid] || 0}/5</strong>
                </div>
              </div>
            ))
          ) : (
            <p>No hay preguntas disponibles en este momento.</p>
          )}

          <button 
            type="submit" 
            className="survey-btn"
            disabled={loading || loadingQuestions || questions.length === 0}
            style={{
              opacity: (loading || loadingQuestions || questions.length === 0) ? 0.6 : 1,
              cursor: (loading || loadingQuestions || questions.length === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Enviando..." : "Enviar Encuesta"}
          </button>
        </form>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ClientSurvey;