#ifndef _NodeGLSLang_src_NanUtils_h_
#define _NodeGLSLang_src_NanUtils_h_

#include <nan.h>


#define _NAN_EXPORT_NUMBER( target, key, value ) target->Set( ::Nan::New<::v8::String>( key ).ToLocalChecked(), ::Nan::New<::v8::Number>( value ) )

#define _V8S( s ) ::Nan::New<::v8::String>( s ).ToLocalChecked()


#endif // header guard
