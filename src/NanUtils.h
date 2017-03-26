#ifndef _NodeGLSLang_src_NanUtils_h_
#define _NodeGLSLang_src_NanUtils_h_

#include <nan.h>


#define _V8S( s ) ::Nan::New<::v8::String>( s ).ToLocalChecked()

#define _NAN_EXPORT_NUMBER( target, key, value ) target->Set( _V8S( key ), ::Nan::New<::v8::Number>( value ) )

#endif // header guard
