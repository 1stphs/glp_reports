# server.R

library(plumber)
library(ggplot2)
library(jsonlite)
library(survminer)
library(survival)

# Load the library functions
# In a real package, you would library(MyPackage)
source("R/theme_utils.R")
source("R/io_utils.R")
source("R/plot_survival.R")
# source("R/plot_forest.R")
# ... source others

#* @apiTitle SciDigitize R-Stat Engine
#* @apiDescription Generates high-fidelity medical charts from JSON configuration.

#* Transform the incoming request body to list
#* @filter cors
function(res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  plumber::forward()
}

#* Handle OPTIONS requests for CORS
#* @options /render/survival
function() {}

#* Generate Survival Plot (Kaplan-Meier)
#* @param req The request body containing JSON config
#* @post /render/survival
function(req, res) {
  # Parse body
  config_list <- tryCatch({
    # Plumber automatically parses JSON body to a list if content-type is json
    if (is.list(req$body)) req$body else jsonlite::fromJSON(req$postBody)
  }, error = function(e) {
    print(paste("JSON Parse Error:", e$message))
    res$status <- 400
    return(list(error = "Invalid JSON body"))
  })
  
  # Check if config_list is valid (it might be the error object from above)
  if (!is.null(config_list$error)) return(config_list)

  # Generate Plot
  tryCatch({
    print("Starting rendering...")
    # debug: print(str(config_list))
    
    # Draw logic
    p <- draw_survival_plot(config_list)
    
    # Render to temp file
    tmp <- tempfile(fileext = ".png")
    
    png(tmp, width = 8, height = 6, units = "in", res = 300)
    print(p)
    dev.off()
    
    # Return file content
    bin_data <- readBin(tmp, "raw", n = file.info(tmp)$size)
    unlink(tmp) # Clean up
    
    res$setHeader("Content-Type", "image/png")
    res$body <- bin_data
    return(res)
    
  }, error = function(e) {
    print(paste("Rendering Internal Error:", e$message))
    # Print traceback if possible
    # traceback()
    res$status <- 500
    res$setHeader("Content-Type", "application/json")
    return(list(error = paste("Rendering failed:", e$message)))
  })
}

#* Check Health
#* @get /health
function() {
  list(status = "ok", version = "1.0.0")
}
