import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; 

export const Buttonloading = ({ 
  loading, 
  text, 
  icon: Icon, 
  className, 
  variant = "default", 
  ...props 
}) => {
  return (
    <Button 
      disabled={loading} 
      variant={variant} 
      className={className} 
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing
        </>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-5 w-5" />}
          {text}
        </>
      )}
    </Button>
  );
};