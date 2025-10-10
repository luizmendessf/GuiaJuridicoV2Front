// src/components/sections/about/ContactSection.jsx
import { useState, useRef } from "react";
import { Mail, Instagram, MapPin, Send, CheckCircle, AlertTriangle } from "lucide-react";
import emailjs from '@emailjs/browser';
import Button from "../../ui/button";
import "./ContactSection.css";

// Componente de Item de Contato (sem alteração)
function ContactInfo({ icon: Icon, title, value, colorClass }) {
  return (
    <div className="contact-info">
      <div className={`contact-info__icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="contact-info__title">{title}</h3>
        <p className="contact-info__value">{value}</p>
      </div>
    </div>
  );
}

// --- NOVOS COMPONENTES PARA FEEDBACK ---

// Componente para a mensagem de sucesso
const SuccessMessage = ({ onReset }) => (
  <div className="text-center anim-fade-in p-4">
    <CheckCircle className="mx-auto mb-4" size={56} style={{ color: "var(--color-primary-500)" }} />
    <h3 className="contact-form__title">Mensagem Enviada!</h3>
    <p className="contact-section__subtitle mt-2">Obrigado por entrar em contato. Responderemos em breve.</p>
    <Button onClick={onReset} variant="secondary" className="mt-6 btn-reset">
      Enviar outra mensagem
    </Button>
  </div>
);

// Componente para a mensagem de erro
const ErrorMessage = ({ onReset }) => (
    <div className="text-center anim-fade-in p-4">
        <AlertTriangle className="mx-auto mb-4" size={56} style={{ color: "#ef4444" }} />
        <h3 className="contact-form__title" style={{ color: "#ef4444" }}>Ocorreu um Erro</h3>
        <p className="contact-section__subtitle mt-2">Não foi possível enviar sua mensagem. Por favor, tente novamente.</p>
        <Button onClick={onReset} variant="secondary" className="mt-6">
            Tentar Novamente
        </Button>
    </div>
);


export default function ContactSection() {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'success', 'error'

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Suas chaves do EmailJS foram inseridas aqui
    emailjs.sendForm(
        'service_elf33zk',    // SEU SERVICE ID
        'template_u1qjnu9',   // SEU TEMPLATE ID
        form.current,
        'B9O3qCyS4cHdrZV9b'     // SUA PUBLIC KEY
      )
      .then((result) => {
          console.log('SUCCESS!', result.text);
          setSubmissionStatus('success');
      }, (error) => {
          console.error('FAILED...', error.text);
          setSubmissionStatus('error');
      })
      .finally(() => {
          setIsSubmitting(false);
      });
  };
  
  // Função para resetar o formulário e voltar ao estado inicial
  const handleReset = () => {
    setSubmissionStatus('idle');
    // Limpar os campos do formulário (opcional, mas recomendado)
    if(form.current) {
      form.current.reset();
    }
  };

  return (
    <section className="section contact-section">
      <div className="section__bg-gradient"></div>
      <div className="container">
        <div className="contact-section__grid">
          <div className="contact-section__info anim-slide-in-left">
            <div className="section-header" style={{textAlign: "left", marginBottom: "2rem"}}>
                <h2 className="section-title">Entre em Contato</h2>
            </div>
            <p className="contact-section__subtitle">
              Tem alguma dúvida, sugestão ou quer fazer parte da nossa equipe? Adoraríamos ouvir de você!
            </p>
            <div className="contact-info__list">
                {/* Usei o email do seu Service ID aqui */}
              <ContactInfo icon={Mail} title="Email" value="guiajuridicobr@gmail.com" colorClass="bg-primary"/>
              <ContactInfo icon={Instagram} title="Instagram" value="@guiajuridicoorg" colorClass="bg-secondary"/>
              <ContactInfo icon={MapPin} title="Localização" value="Aracaju, SE - Brasil" colorClass="bg-primary-secondary"/>
            </div>
          </div>
          
          <div className="card contact-form-card anim-slide-in-right">
             {/* --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL --- */}

             {submissionStatus === 'idle' && (
                <>
                  <div className="card__header">
                      <h3 className="contact-form__title">Preencha o formulário abaixo e entraremos em contato</h3>
                  </div>
                  <div className="card__content">
                    <form ref={form} onSubmit={handleSubmit} className="contact-form">
                      <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input type="text" id="name" name="name" required placeholder="Seu nome completo" disabled={isSubmitting}/>
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="seu@email.com" disabled={isSubmitting}/>
                      </div>
                      <div className="form-group">
                        <label htmlFor="subject">Assunto</label>
                        <input type="text" id="subject" name="subject" required placeholder="Assunto da sua mensagem" disabled={isSubmitting}/>
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Mensagem</label>
                        <textarea id="message" name="message" required rows={5} placeholder="Escreva sua mensagem aqui..." disabled={isSubmitting}/>
                      </div>
                      <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : (
                          <>
                            Enviar Mensagem <Send />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
             )}

             {submissionStatus === 'success' && <SuccessMessage onReset={handleReset} />}
             {submissionStatus === 'error' && <ErrorMessage onReset={handleReset} />}
          </div>
        </div>
      </div>
    </section>
  );
}