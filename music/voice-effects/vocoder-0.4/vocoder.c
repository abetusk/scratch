/* vocoder.c
   Version 0.31

   LADSPA Unique ID: 1441

   Version 0.4
   Code made friendlier towards modern CPUs by Raine M. Ekman <raine at iki.fi>
   2015-07-07

   Version 0.3
   Added support for changing bands in real time 2003-12-09

   Version 0.2
   Adapted to LADSPA by Josh Green <jgreen@users.sourceforge.net>
   15.6.2001 (for the LinuxTag 2001!)

   Original program can be found at:
   http://www.sirlab.de/linux/
   Author: Achim Settelmeier <settel-linux@sirlab.de>
*/

/*****************************************************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

/*****************************************************************************/

#include <ladspa.h>

/*****************************************************************************/

#define MAX_BANDS  16
#define AMPLIFIER 16.0

struct bandpasses
{
  LADSPA_Data c[MAX_BANDS], f[MAX_BANDS], att[MAX_BANDS];

  LADSPA_Data freq[MAX_BANDS];
  LADSPA_Data low1[MAX_BANDS], low2[MAX_BANDS];
  LADSPA_Data mid1[MAX_BANDS], mid2[MAX_BANDS];
  LADSPA_Data high1[MAX_BANDS], high2[MAX_BANDS];
  LADSPA_Data y[MAX_BANDS];
};

struct bands_out{
  LADSPA_Data decay[MAX_BANDS];
  LADSPA_Data oldval[MAX_BANDS];
  LADSPA_Data level[MAX_BANDS];		/* 0.0 - 1.0 level of this output band */
};

const LADSPA_Data decay_table[] =
{
  1/100.0,
  1/100.0, 1/100.0, 1/100.0,
  1/125.0, 1/125.0, 1/125.0,
  1/166.0, 1/166.0, 1/166.0,
  1/200.0, 1/200.0, 1/200.0,
  1/250.0, 1/250.0, 1/250.0
};

/* The port numbers for the plugin: */

#define PORT_FORMANT   0
#define PORT_CARRIER   1
#define PORT_OUTPUT    2
#define CTRL_BANDCOUNT 3
#define CTRL_BAND1LVL  4

#define PORT_COUNT     4 + MAX_BANDS


/* useful macros */
#undef CLAMP
#define CLAMP(x, low, high)  (((x) > (high)) ? (high) : (((x) < (low)) ? (low) : (x)))

/* Instance data for the vocoder plugin */
typedef struct {
  LADSPA_Data SampleRate;

  int num_bands;		/* current number of bands */
  float mainvol;		/* main volume */

  struct bandpasses bands_formant; /* all bands in one struct now */
  struct bandpasses bands_carrier; /* ...same here */ 
  struct bands_out bands_out;      /* ...and here. */

  /* Ports */

  LADSPA_Data * portFormant;	/* Formant signal port data location */
  LADSPA_Data * portCarrier;	/* Carrier signal port data location */
  LADSPA_Data * portOutput;	/* Output audio port data location */
  LADSPA_Data * ctrlBandCount;	/* Band count control */
  LADSPA_Data * ctrlBandLevels[MAX_BANDS]; /* level controls for each band */

} VocoderInstance;

/*****************************************************************************/

/* Construct a new plugin instance. */
LADSPA_Handle 
instantiateVocoder(const LADSPA_Descriptor * Descriptor,
		   unsigned long             SampleRate) {
  VocoderInstance * vocoder;

  vocoder = (VocoderInstance *)malloc(sizeof(VocoderInstance));

  if (vocoder == NULL)
    return NULL;

  vocoder->SampleRate = (LADSPA_Data)SampleRate;
  vocoder->num_bands = -1;

  return vocoder;
}

/*****************************************************************************/

/* Initialise and activate a plugin instance. */
void
activateVocoder(LADSPA_Handle Instance) {
  VocoderInstance *vocoder = (VocoderInstance *)Instance;
  int i;

  vocoder->mainvol = 1.0 * AMPLIFIER;

  for (i = 0; i < MAX_BANDS; i++)
    vocoder->bands_out.oldval[i] = 0.0f;
}

/*****************************************************************************/

/* Connect a port to a data location. */
void 
connectPortToVocoder(LADSPA_Handle Instance,
		     unsigned long Port,
		     LADSPA_Data * DataLocation) {

  VocoderInstance * vocoder;

  vocoder = (VocoderInstance *)Instance;
  switch (Port) {
  case PORT_FORMANT:		/* formant port? */
    vocoder->portFormant = DataLocation;
    break;
  case PORT_CARRIER:		/* carrier port? */
    vocoder->portCarrier = DataLocation;
    break;
  case PORT_OUTPUT:		/* output port? */
    vocoder->portOutput = DataLocation;
    break;
  case CTRL_BANDCOUNT:		/* band count control? */
    vocoder->ctrlBandCount = DataLocation;
    break;
  default:			/* a band level control? */
    if (Port >= CTRL_BAND1LVL && Port < CTRL_BAND1LVL + MAX_BANDS)
      vocoder->ctrlBandLevels[Port - CTRL_BAND1LVL] = DataLocation;
    break;
  }
}

/*****************************************************************************/

// vocoder_do_bandpasses /*fold00*/
void inline vocoder_do_bandpasses(struct bandpasses *bands, LADSPA_Data sample,
			   VocoderInstance *vocoder)
{
  int i;
  for (i=0; i < vocoder->num_bands; i++)
    {
      bands->high1[i] = sample - bands->f[i] * bands->mid1[i] - bands->low1[i];
      bands->mid1[i] += bands->high1[i] * bands->c[i];
      bands->low1[i] += bands->mid1[i];

      bands->high2[i] = bands->low1[i] - bands->f[i] * bands->mid2[i]
	- bands->low2[i];
      bands->mid2[i] += bands->high2[i] * bands->c[i];
      bands->low2[i] += bands->mid2[i];
      bands->y[i]     = bands->high2[i] * bands->att[i];
    }
}

/* Run a vocoder instance for a block of SampleCount samples. */
void 
runVocoder(LADSPA_Handle Instance,
	   unsigned long SampleCount)
{
  VocoderInstance *vocoder = (VocoderInstance *)Instance;
  int i, j, numbands;
  float a;
  LADSPA_Data x, c;

  numbands = (int)(*vocoder->ctrlBandCount);
  if (numbands < 1 || numbands > MAX_BANDS) numbands = MAX_BANDS;

  /* initialize bandpass information if num_bands control has changed,
     or on first run */
  if (vocoder->num_bands != numbands)
    {
      vocoder->num_bands = numbands;

      memset(&vocoder->bands_formant, 0, sizeof(struct bandpasses));
      for(i=0; i < numbands; i++)
	{
	  a = 16.0 * i/(double)numbands;  // stretch existing bands

	  if (a < 4.0)
	    vocoder->bands_formant.freq[i] = 150 + 420 * a / 4.0;
	  else
	    vocoder->bands_formant.freq[i] = 600 * pow (1.23, a - 4.0);	   

	  c = vocoder->bands_formant.freq[i] * 2 * M_PI / vocoder->SampleRate;
	  vocoder->bands_formant.c[i] = c * c;

	  vocoder->bands_formant.f[i] = 0.4/c;
	  vocoder->bands_formant.att[i] =
	    1/(6.0 + ((exp (vocoder->bands_formant.freq[i]
			    / vocoder->SampleRate) - 1) * 10));

	  vocoder->bands_out.decay[i] = decay_table[(int)a];
	  vocoder->bands_out.level[i] =
	    CLAMP (*vocoder->ctrlBandLevels[i], 0.0, 1.0);
	}
      memcpy(&vocoder->bands_carrier,
	     &vocoder->bands_formant, sizeof(struct bandpasses));

    }
  else		       /* get current values of band level controls */
    {
      for (i = 0; i < numbands; i++)
	vocoder->bands_out.level[i] = CLAMP (*vocoder->ctrlBandLevels[i],
					     0.0, 1.0);
    }

  for (i=0; i < SampleCount; i++)
    {
      vocoder_do_bandpasses (&(vocoder->bands_carrier),
			     vocoder->portCarrier[i], vocoder);
      vocoder_do_bandpasses (&(vocoder->bands_formant),
			     vocoder->portFormant[i], vocoder);

      vocoder->portOutput[i] = 0.0;
      for (j=0; j < numbands; j++)
	{
	  vocoder->bands_out.oldval[j] = vocoder->bands_out.oldval[j]
	    + (fabs (vocoder->bands_formant.y[j])
	       - vocoder->bands_out.oldval[j])
	    * vocoder->bands_out.decay[j];
	  x = vocoder->bands_carrier.y[j] * vocoder->bands_out.oldval[j];

	  vocoder->portOutput[i] += x * vocoder->bands_out.level[j];
	}
      vocoder->portOutput[i] *= vocoder->mainvol;
    }
}


/*****************************************************************************/

/* Throw away a vocoder instance. */
void 
cleanupVocoder(LADSPA_Handle Instance)
{
  VocoderInstance * Vocoder;
  Vocoder = (VocoderInstance *)Instance;
  free(Vocoder);
}

/*****************************************************************************/

LADSPA_Descriptor * g_psDescriptor = NULL;

/*****************************************************************************/

/* _init() is called automatically when the plugin library is first
   loaded. */
void 
_init() {
  char ** pcPortNames;
  LADSPA_PortDescriptor * piPortDescriptors;
  LADSPA_PortRangeHint * psPortRangeHints;
  int i;

  g_psDescriptor = (LADSPA_Descriptor *)malloc(sizeof(LADSPA_Descriptor));

  if (g_psDescriptor) {
    g_psDescriptor->UniqueID = 1441;
    g_psDescriptor->Label = strdup("vocoder");
    g_psDescriptor->Properties = LADSPA_PROPERTY_HARD_RT_CAPABLE;
    g_psDescriptor->Name = strdup("Vocoder");
    g_psDescriptor->Maker = strdup("Achim Settelmeier (adapted to LADSPA by Josh Green)");
    g_psDescriptor->Copyright = strdup("None");
    g_psDescriptor->PortCount = PORT_COUNT;
    piPortDescriptors = (LADSPA_PortDescriptor *)calloc(PORT_COUNT,
      sizeof(LADSPA_PortDescriptor));
    g_psDescriptor->PortDescriptors
      = (const LADSPA_PortDescriptor *)piPortDescriptors;
    piPortDescriptors[PORT_FORMANT]
      = LADSPA_PORT_INPUT | LADSPA_PORT_AUDIO;
    piPortDescriptors[PORT_CARRIER]
      = LADSPA_PORT_INPUT | LADSPA_PORT_AUDIO;
    piPortDescriptors[PORT_OUTPUT]
      = LADSPA_PORT_OUTPUT | LADSPA_PORT_AUDIO;
    piPortDescriptors[CTRL_BANDCOUNT]
      = LADSPA_PORT_INPUT | LADSPA_PORT_CONTROL;

    pcPortNames = (char **)calloc(PORT_COUNT, sizeof(char *));
    g_psDescriptor->PortNames = (const char **)pcPortNames;
    pcPortNames[PORT_FORMANT] = strdup("Formant");
    pcPortNames[PORT_CARRIER] = strdup("Carrier");
    pcPortNames[PORT_OUTPUT] = strdup("Output");
    pcPortNames[CTRL_BANDCOUNT] = strdup("Number of bands");

    psPortRangeHints = ((LADSPA_PortRangeHint *)
			calloc(PORT_COUNT, sizeof(LADSPA_PortRangeHint)));
    g_psDescriptor->PortRangeHints
      = (const LADSPA_PortRangeHint *)psPortRangeHints;
    psPortRangeHints[PORT_FORMANT].HintDescriptor = 0;
    psPortRangeHints[PORT_CARRIER].HintDescriptor = 0;
    psPortRangeHints[PORT_OUTPUT].HintDescriptor = 0;
    psPortRangeHints[CTRL_BANDCOUNT].HintDescriptor
      = LADSPA_HINT_BOUNDED_BELOW | LADSPA_HINT_BOUNDED_ABOVE
      | LADSPA_HINT_INTEGER;
    psPortRangeHints[CTRL_BANDCOUNT].LowerBound = 1;
    psPortRangeHints[CTRL_BANDCOUNT].UpperBound = MAX_BANDS;

    for (i=CTRL_BAND1LVL; i < CTRL_BAND1LVL + MAX_BANDS; i++)
      {
	piPortDescriptors[i] = LADSPA_PORT_INPUT | LADSPA_PORT_CONTROL;
	pcPortNames[i] = malloc (sizeof ("Band 99 Level"));
	sprintf(pcPortNames[i], "Band %d Level", i - CTRL_BAND1LVL + 1);
	psPortRangeHints[i].HintDescriptor
	  = LADSPA_HINT_BOUNDED_BELOW | LADSPA_HINT_BOUNDED_ABOVE;
	psPortRangeHints[i].LowerBound = 0;
	psPortRangeHints[i].UpperBound = 1;
      }

    g_psDescriptor->instantiate = instantiateVocoder;
    g_psDescriptor->connect_port = connectPortToVocoder;
    g_psDescriptor->activate = activateVocoder;
    g_psDescriptor->run = runVocoder;
    g_psDescriptor->run_adding = NULL;
    g_psDescriptor->set_run_adding_gain = NULL;
    g_psDescriptor->deactivate = NULL;
    g_psDescriptor->cleanup = cleanupVocoder;
  }
}

/*****************************************************************************/

/* _fini() is called automatically when the library is unloaded. */
void 
_fini() {
  long lIndex;
  if (g_psDescriptor) {
    free((char *)g_psDescriptor->Label);
    free((char *)g_psDescriptor->Name);
    free((char *)g_psDescriptor->Maker);
    free((char *)g_psDescriptor->Copyright);
    free((LADSPA_PortDescriptor *)g_psDescriptor->PortDescriptors);
    for (lIndex = 0; lIndex < g_psDescriptor->PortCount; lIndex++)
      free((char *)(g_psDescriptor->PortNames[lIndex]));
    free((char **)g_psDescriptor->PortNames);
    free((LADSPA_PortRangeHint *)g_psDescriptor->PortRangeHints);
    free(g_psDescriptor);
  }
}

/*****************************************************************************/

/* Return a descriptor of the requested plugin type. Only one plugin
   type is available in this library. */
const LADSPA_Descriptor * 
ladspa_descriptor(unsigned long Index) {
  if (Index == 0)
    return g_psDescriptor;
  else
    return NULL;
}

/*****************************************************************************/

/* EOF */
