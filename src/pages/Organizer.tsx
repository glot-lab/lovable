import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import InterfaceLanguageSelector from "@/components/InterfaceLanguageSelector";
import CreateEventForm from "@/components/CreateEventForm";
import EventShareView from "@/components/EventShareView";
import EventMonitorView from "@/components/EventMonitorView";
import { ArrowLeft } from "lucide-react";
import glotLogoNew from "@/assets/glot-logo-new.png";

type WorkflowStep = 'create' | 'share' | 'monitor';

const Organizer = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('create');
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  const handleEventCreated = (eventData: any) => {
    setCurrentEvent(eventData);
    setCurrentStep('share');
  };

  const handleBackToCreate = () => {
    setCurrentStep('create');
    setCurrentEvent(null);
  };

  const handleContinueToMonitor = () => {
    setCurrentStep('monitor');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <div className="flex items-center space-x-2 sm:space-x-4 max-w-full overflow-x-auto px-2">
        {[
          { key: 'create', label: t('organizer.workflow.create') },
          { key: 'share', label: t('organizer.workflow.share') },
          { key: 'monitor', label: t('organizer.workflow.monitor') }
        ].map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-w-0">
              <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${
                currentStep === step.key 
                  ? 'bg-glot-green text-background border-glot-green' 
                  : currentStep === 'share' && step.key === 'create' || 
                    currentStep === 'monitor' && (step.key === 'create' || step.key === 'share')
                  ? 'bg-glot-green/20 text-glot-green border-glot-green'
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center sm:text-left whitespace-nowrap ${
                currentStep === step.key ? 'text-glot-green' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
            {index < 2 && (
              <div className={`hidden sm:block w-4 sm:w-8 h-0.5 ${
                currentStep === 'share' && step.key === 'create' || 
                currentStep === 'monitor' && step.key !== 'monitor'
                  ? 'bg-glot-green' 
                  : 'bg-border'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 'create':
        return <CreateEventForm onEventCreated={handleEventCreated} />;
      case 'share':
        return (
          <EventShareView 
            eventData={currentEvent}
            onBack={handleBackToCreate}
            onContinueToMonitor={handleContinueToMonitor}
          />
        );
      case 'monitor':
        return (
          <EventMonitorView 
            eventData={currentEvent}
            onBack={() => setCurrentStep('share')}
            onNewEvent={handleBackToCreate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="border-b bg-card shadow-subtle relative">
        <InterfaceLanguageSelector />
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-12 sm:pr-4">
              <a href="/" className="flex-shrink-0 p-1 hover:bg-muted rounded-md transition-colors">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground" />
              </a>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">{t('organizer.title')}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {t('organizer.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Badge variant="outline" className="bg-muted/50 text-foreground border-border/50 text-xs px-2 py-1 hidden sm:flex">
                {t('common.connected')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 max-w-7xl">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <div className="animate-slide-up">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Organizer;